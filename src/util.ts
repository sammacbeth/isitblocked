import { RequestType } from "@cliqz/adblocker";

export function guessTypeFromPath(pathname: string): RequestType {
  if (pathname.endsWith(".js")) {
    return "script";
  }
  if (pathname.endsWith(".css")) {
    return "stylesheet";
  }
  return "xmlhttprequest";
}
