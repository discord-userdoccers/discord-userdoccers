export const runtime = "edge";

export default function handler() {
  return Response.redirect(process.env.ERROR_CODES_ENDPOINT ?? "https://docs.discord.food/api/codes", 301);
}
