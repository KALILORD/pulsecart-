import { fetchAliExpressSearch } from "../pipeline/src/lib/aliexpress";

const queries = ["wireless earbuds", "sunset projection lamp", "portable blender", "led strip lights", "posture corrector", "car phone holder"];

async function main() {
  for (const query of queries) {
    const items = await fetchAliExpressSearch(query, 6);
    console.log(`\n### ${query}`);
    for (const item of items) {
      console.log(
        JSON.stringify({
          title: item.title,
          image: item.image,
          salePrice: item.salePrice,
          currency: item.currency,
          sold: item.sold,
          url: item.url,
        }),
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
