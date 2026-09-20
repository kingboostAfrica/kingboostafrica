import { revalidatePath } from "next/cache";

// Stock levels change when an order is placed or cancelled: refresh the pages that show stock.
export function revalidateCatalog() {
  try {
    revalidatePath("/");
    revalidatePath("/food-mart", "layout");
    revalidatePath("/products/[slug]", "page");
  } catch (err) {
    console.error("Revalidate failed:", err);
  }
}
