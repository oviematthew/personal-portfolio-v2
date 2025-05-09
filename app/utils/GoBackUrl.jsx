// utils/getBackUrl.js

import { headers } from "next/headers";

// fallback defaults to "/"
export default async function GoBackUrl(fallback = "/") {
  const headerList = await headers();
  const referer = headerList.get("referer");

  return referer || fallback;
}
