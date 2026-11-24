---
title: "Building a Headless WooCommerce Store in Next.js"
slug: "headless-woocommerce-store-nextjs"
excerpt: "A step-by-step guide to pulling WooCommerce products into a Next.js App Router site, caching them with ISR, keeping a cart on the frontend and handing off to the WooCommerce checkout you already have."
date: "2026-08-12"
---

This is a step-by-step guide to running a WooCommerce store headless: products come from WooCommerce, the storefront and cart are built in Next.js, and customers pay on the WooCommerce checkout you already have. That keeps payments, taxes and order emails where they already work, while the shop itself matches the rest of your site.

## What you need

- A WordPress site running WooCommerce. I'll assume it lives at `https://shop.example.com`. A subdomain is the most common setup, but a separate domain works too.
- WooCommerce 9.9 or newer, for the checkout links we use at the end. Older versions can still follow most of this.
- Pretty permalinks turned on in WordPress (Settings → Permalinks, anything except "Plain"), otherwise `/wp-json/` routes won't resolve.
- A Next.js App Router project. The examples are plain JavaScript so they're easy to drop into any project.

## Step 1: Pick the right API

WooCommerce has two APIs, and choosing the right one saves you a headache later.

The **REST API** (`/wp-json/wc/v3/`) is the admin API. It can create orders, edit products and read customer data, so it needs a consumer key and secret. Those keys can't ever end up in the browser.

The **Store API** (`/wp-json/wc/store/v1/`) is the public API WooCommerce's own block-based cart and checkout use. It only exposes what a shopper could already see on the store: published products, prices, images, categories and stock status. No keys needed.

For a storefront, the Store API is what you want. Before writing any code, check that it responds:

```bash
curl "https://shop.example.com/wp-json/wc/store/v1/products?per_page=2"
```

You should get back a JSON array of products. If you get a 404, check your permalinks. If you get a 403 or an HTML page, a security or caching plugin is probably blocking `/wp-json/`, and you'll need to allow it.

## Step 2: Add the store URL to your environment

In `.env.local`:

```bash
WC_STORE_URL=https://shop.example.com
```

I keep it server-only (no `NEXT_PUBLIC_` prefix) for anything that fetches products, because all of that runs on the server. The one place the browser needs the URL is the checkout button, and we'll handle that separately.

While you're in config, let `next/image` load product images from WordPress:

```js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shop.example.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
```

## Step 3: Write a small WooCommerce client

All product fetching goes through one file. That way caching rules, error handling and the store URL live in one place instead of being copied into every page.

```js
// lib/woocommerce.js
const STORE_URL = process.env.WC_STORE_URL;
const API = `${STORE_URL}/wp-json/wc/store/v1`;

// How long product data is cached, in seconds
export const REVALIDATE = 300;

async function wcFetch(path, params = {}) {
  const url = new URL(`${API}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  });

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE, tags: ["woocommerce"] },
  });

  if (!res.ok) {
    throw new Error(`WooCommerce request failed: ${res.status} ${url.pathname}`);
  }

  return {
    data: await res.json(),
    totalPages: Number(res.headers.get("X-WP-TotalPages") || 1),
  };
}

export async function getProducts({ category, orderby, order, page = 1 } = {}) {
  const { data } = await wcFetch("/products", {
    per_page: 24,
    page,
    category,
    orderby,
    order,
  });
  return data;
}

export async function getProductBySlug(slug) {
  const { data } = await wcFetch("/products", { slug });
  return data[0] ?? null;
}

export async function getCategories() {
  const { data } = await wcFetch("/products/categories");
  return data.filter((cat) => cat.count > 0);
}
```

There are two things in the `fetch` call worth explaining.

`revalidate: 300` tells Next.js to cache the response and refresh it in the background at most every five minutes. Your pages load from cache, and a price change in WordPress shows up within five minutes without a redeploy. Pick a number that matches how often the store changes.

`tags: ["woocommerce"]` labels every product request so we can clear them all at once later, when we add a webhook in Step 9.

The Store API returns at most 100 products per request. If you have more than that, loop over pages using the `X-WP-TotalPages` header. I return it from `wcFetch` for exactly that reason.

## Step 4: Format prices properly

This one catches almost everyone. The Store API doesn't return prices like `"49.99"`. It returns them in the currency's smallest unit, as strings, with the details needed to format them:

```json
"prices": {
  "price": "4999",
  "regular_price": "5999",
  "sale_price": "4999",
  "currency_code": "USD",
  "currency_minor_unit": 2
}
```

So `4999` with a minor unit of `2` is $49.99. A small helper takes care of it, and `Intl.NumberFormat` handles the symbol and locale:

```js
// lib/price.js
export function formatPrice(prices, amount = prices.price) {
  const value = Number(amount) / 10 ** prices.currency_minor_unit;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: prices.currency_code,
  }).format(value);
}
```

If you skip this and render `prices.price` directly, your $49.99 product shows up as $4,999. Ask me how I know.

## Step 5: Build the shop page

The shop page is a Server Component. It fetches products on the server, so no API calls happen in the browser and the HTML arrives with the products already in it, which is good for both speed and SEO.

```jsx
// app/shop/page.jsx
import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories } from "@/lib/woocommerce";
import { formatPrice } from "@/lib/price";

export const revalidate = 300;

export const metadata = {
  title: "Shop",
  description: "Browse our products.",
};

export default async function ShopPage({ searchParams }) {
  const { category, sort } = await searchParams;
  const [orderby, order] = (sort ?? "date-desc").split("-");

  const [products, categories] = await Promise.all([
    getProducts({ category, orderby, order }),
    getCategories(),
  ]);

  return (
    <main>
      <nav aria-label="Categories">
        <Link href="/shop">All</Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/shop?category=${cat.slug}`}>
            {cat.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/shop/${product.slug}`}>
                {product.images[0] && (
                  <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt || product.name}
                    width={600}
                    height={600}
                    sizes="(min-width: 768px) 33vw, 50vw"
                  />
                )}
                <h2>{product.name}</h2>
                <p>{formatPrice(product.prices)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

Filtering and sorting live in the URL (`/shop?category=presets&sort=price-asc`), not in React state. That way a filtered view can be shared or bookmarked, the back button works, and the page stays a Server Component. Because the page reads `searchParams` it renders per request, but the product data underneath is still cached by the `fetch` from Step 3, so it stays fast.

The Store API's `orderby` accepts values like `date`, `price`, `popularity`, `rating` and `title`, so a sort dropdown can map straight onto it.

## Step 6: Build the product page with ISR

Product pages are where ISR (Incremental Static Regeneration) pays off. We pre-render every product at build time, serve them as static pages, and let Next.js regenerate each one in the background when its data goes stale.

```jsx
// app/shop/[slug]/page.jsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProducts, getProductBySlug } from "@/lib/woocommerce";
import { formatPrice } from "@/lib/price";
import AddToCart from "./AddToCart";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.short_description.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: { images: product.images.slice(0, 1).map((img) => img.src) },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const onSale = product.prices.sale_price !== product.prices.regular_price;

  return (
    <main className="grid gap-10 md:grid-cols-2">
      <div className="min-w-0">
        {product.images.map((img) => (
          <Image key={img.id} src={img.src} alt={img.alt || product.name} width={1000} height={1000} />
        ))}
      </div>

      <div className="min-w-0">
        <h1>{product.name}</h1>
        <p>
          {formatPrice(product.prices)}
          {onSale && <s>{formatPrice(product.prices, product.prices.regular_price)}</s>}
        </p>

        <div dangerouslySetInnerHTML={{ __html: product.description }} />

        {product.is_purchasable && product.is_in_stock ? (
          <AddToCart product={product} />
        ) : (
          <p>Out of stock</p>
        )}
      </div>
    </main>
  );
}
```

A few notes on this page:

- **New products work without a rebuild.** Products added in WordPress after your last deploy aren't in `generateStaticParams`, but Next.js renders them on the first visit and caches them from then on.
- **Deleted products 404.** `getProductBySlug` returns `null` and `notFound()` takes over. Once the cache refreshes, the old page stops being served.
- **The description is HTML.** WooCommerce stores it as HTML, so it needs `dangerouslySetInnerHTML`. That's acceptable because the content comes from your own store admins, not the public. If other people can write product content, run it through a sanitizer first.
- **That `min-w-0` matters.** Grid items default to `min-width: auto`, so a wide thumbnail strip or a long unbroken word can stretch the column and make the page scroll sideways on mobile. `min-w-0` lets the column shrink to fit. It's an easy bug to miss if you only test on desktop.

## Step 7: Keep the cart on the frontend

The cart doesn't have to live in WooCommerce until checkout. Keeping it in the browser means adding an item is instant, with no round trip to WordPress and no cookies shared across domains.

A small React context with `localStorage` is enough:

```jsx
// app/cart/CartContext.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  // Load the saved cart after mount so server and client HTML match
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = (product, quantity = 1) =>
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0]?.src,
          prices: product.prices,
          quantity,
        },
      ];
    });

  const updateQuantity = (id, quantity) =>
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, ready, addItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
```

### Wrap the app in the provider

The provider only works for components rendered inside it, so it goes in the root layout. That way every page, the header and the cart drawer all share the same cart.

```jsx
// app/layout.jsx
import { CartProvider } from "@/app/cart/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: {
    default: "My Store",
    template: "%s | My Store",
  },
  description: "Shop our products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
```

The layout itself has no `"use client"` at the top, and it shouldn't. It stays a Server Component, which is also why it can still export `metadata`. Only `CartContext.jsx` is a Client Component, because it uses `useState`, `useEffect` and `localStorage`, none of which exist on the server.

That might look like it would turn the whole site into client code, since every page now sits inside a Client Component. It doesn't. `children` are rendered on the server first and passed into the provider already rendered, so your shop page and product pages stay Server Components and keep fetching on the server. The rule is about imports, not nesting: a Client Component can't `import` a Server Component, but it can receive one as `children`.

Put the provider inside `<body>`, not around `<html>`, and keep it as low as you can while still covering everything that needs the cart. Here that's the header (for the cart icon) and the pages (for the add to cart buttons), so just inside `<body>` is the right spot.

### Show the cart count in the header

The header can stay a Server Component too. Only the small cart button needs the cart, so it gets its own client file:

```jsx
// components/CartButton.jsx
"use client";

import Link from "next/link";
import { useCart } from "@/app/cart/CartContext";

export default function CartButton() {
  const { items, ready } = useCart();
  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link href="/cart" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
      Cart
      {ready && count > 0 && <span>{count}</span>}
    </Link>
  );
}
```

```jsx
// components/Header.jsx (a Server Component, no "use client")
import Link from "next/link";
import CartButton from "./CartButton";

export default function Header() {
  return (
    <header>
      <Link href="/">My Store</Link>
      <nav>
        <Link href="/shop">Shop</Link>
        <CartButton />
      </nav>
    </header>
  );
}
```

Checking `ready` before showing the badge stops it flashing "0" on every page load while the saved cart is read from `localStorage`.

If `useCart()` ever returns `undefined`, the component calling it is outside the provider. A small guard makes that mistake obvious instead of failing with a confusing error later:

```jsx
export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside <CartProvider>");
  return cart;
}
```

You can use that in place of the one-line `useCart` export above.

Two details I'd keep:

- **Read `localStorage` in an effect, not during render.** The server doesn't have `localStorage`. If you read it during the first render, the server HTML (empty cart) and client HTML (full cart) won't match and React will complain about hydration. The `ready` flag also lets you hide the cart count until the real value has loaded, instead of flashing a zero.
- **Version the storage key.** If the shape of a cart item ever changes, bumping `cart_v1` to `cart_v2` throws away old carts cleanly instead of crashing on them.

Prices in the cart are only for display. The price the customer actually pays always comes from WooCommerce at checkout, so a stale price in someone's `localStorage` can't get them a discount.

The add to cart button is then a small Client Component:

```jsx
// app/shop/[slug]/AddToCart.jsx
"use client";

import { useState } from "react";
import { useCart } from "@/app/cart/CartContext";

export default function AddToCart({ product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <label htmlFor="qty">Quantity</label>
      <input
        id="qty"
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
      />
      <button onClick={() => addItem(product, quantity)}>Add to cart</button>
    </div>
  );
}
```

This is also where a slide-out cart drawer fits. Open it after `addItem` so the customer gets clear feedback without leaving the page.

## Step 8: Hand off to the WooCommerce checkout

This is the step that ties it together. WooCommerce 9.9 added **checkout links**: a URL that builds a cart from product IDs and quantities and sends the customer straight to checkout.

```text
https://shop.example.com/checkout-link/?products=123:2,456:1
```

That's product `123` with quantity 2 and product `456` with quantity 1. You can add `&coupon=CODE` to apply a coupon too. Building the link from our cart is one function:

```js
// lib/checkout.js
const STORE_URL = process.env.NEXT_PUBLIC_WC_STORE_URL;

export function getCheckoutUrl(items) {
  const products = items.map((item) => `${item.id}:${item.quantity}`).join(",");
  return `${STORE_URL}/checkout-link/?products=${products}`;
}
```

This one does need a `NEXT_PUBLIC_` variable, because the checkout button runs in the browser:

```bash
NEXT_PUBLIC_WC_STORE_URL=https://shop.example.com
```

And the button:

```jsx
"use client";

import { useCart } from "@/app/cart/CartContext";
import { getCheckoutUrl } from "@/lib/checkout";

export default function CheckoutButton() {
  const { items } = useCart();
  if (items.length === 0) return null;

  return <a href={getCheckoutUrl(items)}>Checkout</a>;
}
```

A plain link is the right tool here. The customer is leaving your Next.js site for the store's domain, so there's nothing for client-side routing to do.

Some things to know before you ship it:

- **Variable products need the variation ID.** For a product with sizes or colours, the cart has to store the chosen variation's ID, not the parent product's. The Store API lists them under `variations` on the product.
- **Don't clear the cart on click.** If the customer comes back from checkout without paying, they should still find their cart. Clear it when you know the order went through, for example on a thank-you page.
- **Make the checkout look like your site.** The customer is now on WooCommerce. Spend a little time on the WordPress theme so the checkout uses the same logo, colours and fonts. Even a simple match makes the jump feel intentional instead of jarring.
- **On older WooCommerce,** a link like `/?add-to-cart=123&quantity=2` works for a single product. For multiple products you'd need a small custom plugin that reads the cart from the URL, which is more work. Upgrading is usually the easier route.

## Step 9: Refresh instantly with a webhook (optional)

The five-minute `revalidate` is often enough. When the store owner wants a price change live right away, a WooCommerce webhook can clear the cache the moment a product is saved.

First, a route handler that checks the webhook's signature and clears everything tagged `woocommerce`:

```js
// app/api/revalidate/route.js
import crypto from "crypto";
import { revalidateTag } from "next/cache";

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");

  // WooCommerce's first request is a ping with no signature. Answer it with a 200.
  if (!signature) return new Response("ok");

  const expected = crypto
    .createHmac("sha256", process.env.WC_WEBHOOK_SECRET)
    .update(body)
    .digest("base64");

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return new Response("Invalid signature", { status: 401 });
  }

  revalidateTag("woocommerce", { expire: 0 });
  return Response.json({ revalidated: true });
}
```

Then, in WordPress, go to WooCommerce → Settings → Advanced → Webhooks and add one:

- **Topic:** Product updated (add separate webhooks for Product created and Product deleted if you want those covered too)
- **Delivery URL:** `https://www.example.com/api/revalidate`
- **Secret:** a long random string, which also goes in your Next.js environment as `WC_WEBHOOK_SECRET`

WooCommerce signs every delivery with that secret, so random requests to your endpoint can't clear your cache. On Next.js 15 and earlier, `revalidateTag` takes just the tag: `revalidateTag("woocommerce")`.

Keep the timed `revalidate` in place even with the webhook. Webhooks fail sometimes, and the timer is your safety net.

## Step 10: Redirect the old store pages with an mu-plugin

Right now the old WooCommerce shop is still live at `shop.example.com`. Anyone with an old link, a bookmark or a Google result lands on the old design, and search engines see every product on two different URLs. We want visitors browsing the old shop to end up on the new one, while checkout, the cart and customer accounts keep working on the store.

We'll do that with a small PHP file in WordPress.

### Why an mu-plugin

WordPress loads every PHP file in `wp-content/mu-plugins/` automatically. "mu" stands for "must-use": these plugins don't appear in the normal Plugins list, can't be switched off from the dashboard, and load before regular plugins. That's what we want for code the storefront depends on. Nobody can deactivate it by accident while tidying up plugins, and a theme change won't remove it, which is what would happen if you put this in the theme's `functions.php`.

The `mu-plugins` folder doesn't exist by default. Create it with your host's file manager, SFTP or SSH:

```bash
# from the WordPress root (the folder that contains wp-config.php)
mkdir -p wp-content/mu-plugins
```

Only PHP files directly inside the folder are loaded. Files in subfolders are ignored unless you load them yourself, so keep the plugin as a single file at the top level.

### Tell WordPress where the storefront lives

Rather than hard-coding the Next.js URL in the plugin, define it in `wp-config.php`. Then the same plugin file works on a staging store and the live one. Add this above the line that says `/* That's all, stop editing! */`:

```php
// wp-config.php
define( 'HEADLESS_STOREFRONT_URL', 'https://www.example.com' );
```

### The plugin

Create `wp-content/mu-plugins/headless-storefront.php`:

```php
<?php
/**
 * Plugin Name: Headless Storefront
 * Description: Sends shoppers on the old WooCommerce pages to the Next.js storefront.
 * Version: 1.0.0
 */

// Stop if this file is opened directly instead of loaded by WordPress.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// The Next.js site, defined in wp-config.php. Fall back to a safe default.
if ( ! defined( 'HEADLESS_STOREFRONT_URL' ) ) {
	define( 'HEADLESS_STOREFRONT_URL', 'https://www.example.com' );
}

/**
 * 1. Redirect catalogue pages to the storefront.
 *
 * template_redirect runs just before WordPress picks a theme template, so it
 * only fires for normal front-end page views. REST API requests (including the
 * Store API our Next.js site uses), admin-ajax calls, wp-admin and wp-login.php
 * never reach it.
 */
add_action( 'template_redirect', function () {
	// WooCommerce not active, or not a front-end page view: do nothing.
	if ( ! function_exists( 'is_woocommerce' ) || is_admin() || wp_doing_ajax() ) {
		return;
	}

	// Let store managers still see the old shop with ?preview_shop=1.
	if ( isset( $_GET['preview_shop'] ) && current_user_can( 'manage_woocommerce' ) ) {
		return;
	}

	$storefront = untrailingslashit( HEADLESS_STOREFRONT_URL );

	// A single product: send it to the matching product page.
	if ( is_product() ) {
		$slug = get_post_field( 'post_name', get_queried_object_id() );
		wp_redirect( $storefront . '/shop/' . rawurlencode( $slug ), 301 );
		exit;
	}

	// The shop page, categories, tags and the store's home page.
	if ( is_shop() || is_product_category() || is_product_tag() || is_front_page() ) {
		wp_redirect( $storefront . '/shop', 301 );
		exit;
	}

	// An empty cart has nothing to check out, so show the storefront's cart.
	if ( is_cart() && WC()->cart && WC()->cart->is_empty() ) {
		wp_redirect( $storefront . '/cart', 302 );
		exit;
	}

	// Everything else (checkout, order received, my account, pages and posts)
	// stays on the store.
} );

/**
 * 2. Point WooCommerce's own "Return to shop" and "Continue shopping"
 * buttons at the storefront instead of the old shop page.
 */
add_filter( 'woocommerce_return_to_shop_redirect', function () {
	return untrailingslashit( HEADLESS_STOREFRONT_URL ) . '/shop';
} );

add_filter( 'woocommerce_continue_shopping_redirect', function () {
	return untrailingslashit( HEADLESS_STOREFRONT_URL ) . '/shop';
} );

/**
 * 3. Allow wp_safe_redirect() to send people to the storefront domain.
 * By default WordPress only allows safe redirects to its own domain.
 */
add_filter( 'allowed_redirect_hosts', function ( $hosts ) {
	$host = wp_parse_url( HEADLESS_STOREFRONT_URL, PHP_URL_HOST );
	if ( $host ) {
		$hosts[] = $host;
	}
	return $hosts;
} );
```

### How it decides what to redirect

The important choice here is to use WooCommerce's conditional tags (`is_product()`, `is_shop()`, `is_cart()`) instead of matching URLs with regular expressions. A URL pattern like "anything starting with `/shop`" is easy to get wrong. Stores have custom permalink bases, translated slugs and query strings, and one bad pattern can redirect checkout and quietly break every sale. The conditional tags ask WooCommerce what kind of page this is, so they keep working whatever your permalinks look like.

Here is what happens to each kind of request:

- **Product pages** get a `301` to `/shop/<same-slug>` on the Next.js site. Because Step 6 uses the WooCommerce slug in the URL, every old product link maps straight to the new page. A 301 tells search engines the move is permanent, so they move the page's ranking across instead of indexing both.
- **Shop, category and tag pages, and the store's home page** go to `/shop`. If you build category pages on the Next.js side, you could send `is_product_category()` to `/shop?category=<slug>` instead.
- **An empty cart** goes to the storefront's cart with a `302`, a temporary redirect, because the cart page itself hasn't moved. A cart with items in it stays put, which matters for a customer who came back from checkout to change something.
- **Checkout, order received and My Account** aren't matched by any condition, so they keep working on the store. That's where payment happens, so it should never be redirected.
- **The Store API, REST API, AJAX, wp-admin and the login page** never reach `template_redirect` at all, so your Next.js site can keep fetching products and the store owner can still log in to the dashboard.

The `?preview_shop=1` escape hatch is there for the store owner. Logged in as an admin, they can still open `shop.example.com/?preview_shop=1` to check the old shop page. Customers can't use it, because of the `current_user_can()` check.

### Check that it works

Upload the file, then try these. `curl -I` shows only the response headers, which is all you need to see a redirect:

```bash
# A product page should 301 to the matching Next.js page
curl -I https://shop.example.com/product/blue-hoodie/
# HTTP/2 301
# location: https://www.example.com/shop/blue-hoodie

# The shop page should 301 to /shop
curl -I https://shop.example.com/shop/
# HTTP/2 301
# location: https://www.example.com/shop

# The Store API must NOT redirect
curl -I "https://shop.example.com/wp-json/wc/store/v1/products"
# HTTP/2 200

# Checkout must NOT redirect
curl -I https://shop.example.com/checkout/
# HTTP/2 200
```

Then go through the real flow once in a browser: add something to the cart on your Next.js site, check out, and make sure you land on the WooCommerce checkout and can place a test order.

If nothing redirects, check that the file is directly inside `wp-content/mu-plugins/` (not in a subfolder), and look for it under Plugins → Must-Use in the dashboard. If old pages still show after that, a page cache is probably serving the old version. Clear it in your caching plugin or your host's control panel.

## Step 11: Keep shared secrets in wp-config.php

As soon as your Next.js site and WordPress need to trust each other, you need a shared secret. That might be the webhook from Step 9, or a custom endpoint like the account login in the next section. The secret is a long random string that both sides know and nobody else does. Next.js sends it with each request, and WordPress refuses any request that doesn't have it.

### Generate the secret

Run this in any terminal:

```bash
openssl rand -hex 32
```

It prints 64 random hexadecimal characters (32 random bytes), something like:

```text
9f2c4a7e1b8d03f6c5e9a2b7d4f81c6e0a3b5d7f9e2c4a6b8d0f1e3c5a7b9d2f
```

Use your own output, not this example. Don't make up a password yourself either: people are bad at randomness, and a short or guessable secret makes the whole check pointless. If you need more than one secret (one for the webhook and one for logins, say), run the command again for each one so each has a different value.

### Add it to wp-config.php

`wp-config.php` sits in the WordPress root, next to the `wp-admin` and `wp-content` folders. Open it and add your constant above the `/* That's all, stop editing! */` line:

```php
// wp-config.php

/* Headless storefront */
define( 'HEADLESS_STOREFRONT_URL', 'https://www.example.com' );
define( 'HEADLESS_SECRET', '9f2c4a7e1b8d03f6c5e9a2b7d4f81c6e0a3b5d7f9e2c4a6b8d0f1e3c5a7b9d2f' );

/* That's all, stop editing! Happy publishing. */
```

Position matters. WordPress starts loading itself right after that "stop editing" line, so constants defined below it are set too late for plugins to see them.

Why `wp-config.php` and not the database or the plugin file?

- **It isn't in the database.** Options saved in the database show up in backups, exports and staging copies, and any plugin can read them. `wp-config.php` stays on the server.
- **It isn't in your code.** The mu-plugin can live in git and be shared, like in this post, without leaking anything. Only the server has the real value.
- **It's never served to browsers.** `wp-config.php` is PHP, so the web server runs it instead of sending its contents to visitors.

If your WordPress site is in git, make sure `wp-config.php` is in `.gitignore`. Most hosts keep it out of the repository by default, but check.

### Put the same value in Next.js

The Next.js side needs the exact same string. Locally, add it to `.env.local`:

```bash
# .env.local (never commit this file)
WC_STORE_URL=https://shop.example.com
NEXT_PUBLIC_WC_STORE_URL=https://shop.example.com
HEADLESS_SECRET=9f2c4a7e1b8d03f6c5e9a2b7d4f81c6e0a3b5d7f9e2c4a6b8d0f1e3c5a7b9d2f
```

`create-next-app` already adds `.env*.local` to `.gitignore`, but it's worth confirming with `git check-ignore .env.local`. If it prints the file name, the file is ignored.

Note there's no `NEXT_PUBLIC_` prefix on the secret. Anything with that prefix gets copied into the JavaScript sent to the browser, where anyone can read it. The secret must only ever be read on the server: in route handlers, Server Components and Server Actions.

In production, add it to your host. On Vercel that's Project → Settings → Environment Variables: add `HEADLESS_SECRET` with the same value for Production (and Preview if your preview deployments talk to a store). Environment variables are only read at build time and when functions start, so **redeploy** after adding or changing one. Otherwise the running site keeps the old value.

### Use it on both sides

On the Next.js side, send the secret in a header from server code only:

```js
// lib/wordpress.js (server-only)
const STORE_URL = process.env.WC_STORE_URL;

export async function callWordPress(path, { method = "GET", body } = {}) {
  const secret = process.env.HEADLESS_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("HEADLESS_SECRET is missing or too short");
  }

  const res = await fetch(`${STORE_URL}/wp-json/headless/v1${path}`, {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Headless-Secret": secret,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(`WordPress request failed: ${res.status}`);
  return res.json();
}
```

On the WordPress side, check it before your endpoint does anything. This goes in the same mu-plugin:

```php
/**
 * Only allow requests that carry the shared secret.
 * Used as the permission_callback for our custom REST routes.
 */
function headless_check_secret( WP_REST_Request $request ) {
	$secret = defined( 'HEADLESS_SECRET' ) ? (string) HEADLESS_SECRET : '';
	$given  = (string) $request->get_header( 'x-headless-secret' );

	// Refuse everything if the secret is missing or too short.
	// hash_equals() compares in constant time, so the response time
	// doesn't leak how much of a guess was right.
	if ( strlen( $secret ) < 32 || ! hash_equals( $secret, $given ) ) {
		return new WP_Error( 'forbidden', 'Forbidden', array( 'status' => 403 ) );
	}

	return true;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'headless/v1', '/ping', array(
		'methods'             => 'GET',
		'permission_callback' => 'headless_check_secret',
		'callback'            => function () {
			return array( 'ok' => true );
		},
	) );
} );
```

Two details in there matter more than they look:

- **The `strlen( $secret ) < 32` check.** If someone forgets to add the constant, `$secret` is an empty string. Without this check, a request with an empty header would match it and get through. This way a missing secret locks the endpoint instead of opening it.
- **`hash_equals()` instead of `===`.** A normal comparison stops at the first character that differs, so in theory an attacker can time responses to guess the secret one character at a time. `hash_equals()` always takes the same time.

### Check that it works

```bash
# Without the secret: refused
curl -i https://shop.example.com/wp-json/headless/v1/ping
# HTTP/2 403

# With the secret: allowed
curl -i -H "X-Headless-Secret: <your secret>" https://shop.example.com/wp-json/headless/v1/ping
# HTTP/2 200
# {"ok":true}
```

If the second request also returns 403, the values don't match. A missing character from copying, or a space or line break pasted into the Vercel field, is the usual cause. If it returns 404, the mu-plugin isn't loading.

If the secret ever leaks (committed by accident or pasted into a chat), generate a new one with `openssl rand -hex 32`, update `wp-config.php` and your environment variables, and redeploy. The old one stops working the moment `wp-config.php` changes.

## Step 12: Tidy up the WordPress side

A few last things on the store:

- **Point emails and the logo at your site.** WooCommerce emails and the store's header logo should link to your Next.js site, not the old shop page.
- **Watch out for caching plugins.** Page caching on WordPress can hold on to stale Store API responses. Exclude `/wp-json/` from page caching if prices aren't updating.
- **Match the checkout design.** As mentioned in Step 8, a little styling on the WooCommerce theme makes the jump to checkout feel like the same site.

## Where to go from here

What we've built covers most stores: a fast, server-rendered catalogue, product pages that stay up to date without redeploys, an instant cart and a checkout you didn't have to rebuild.

From here, the usual next steps are:

- **Search**, using the Store API's `search` parameter.
- **Customer accounts**, so people can sign in on your site and arrive at checkout already logged in. The Store API doesn't handle logins, so this builds on Step 11: custom REST routes in the mu-plugin, protected by the shared secret, that check a customer's email and password with WordPress's `wp_authenticate()`.
- **A thank-you page** on your Next.js site, with WooCommerce redirecting there after payment, so the order confirmation feels like part of the same experience.

The main idea holds for all of them: let WooCommerce do the commerce and let Next.js do the experience. Once you draw that line clearly, each piece stays simple.
