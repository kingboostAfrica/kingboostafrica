import Link from "next/link";
import PolicyLayout, { Note, P, UL, type PolicySection } from "@/components/PolicyLayout";

export const metadata = {
  title: "Delivery & Refund Policy — KingBoostFarms",
  description:
    "How delivery and self pickup work, how to cancel an order, and how refunds are handled at KingBoostFarms.",
};

const sections: PolicySection[] = [
  {
    id: "overview",
    title: "About this policy",
    body: (
      <>
        <P>
          This policy explains how orders from the KingBoostFarms Food Mart are delivered or collected, how you can
          cancel an order, and when and how you are refunded. It forms part of the terms on which we sell to you. By
          placing an order you agree to it.
        </P>
        <P>
          Course enrolments (Academy) and consulting requests are arranged directly with our team. Their fees, dates
          and cancellation terms are confirmed with you when we get in touch.
        </P>
      </>
    ),
  },
  {
    id: "receiving",
    title: "Delivery or self pickup",
    body: (
      <>
        <P>At checkout you choose how to receive your order:</P>
        <UL>
          <li>
            <strong>Delivery.</strong> We bring your order to the address you give us. You choose your delivery area
            and the delivery fee for that area is shown before you pay.
          </li>
          <li>
            <strong>Self pickup</strong> (when we offer it). You collect your order yourself, and there is no delivery
            fee. The pickup address and any opening hours are shown at checkout and in your confirmation email.
          </li>
        </UL>
      </>
    ),
  },
  {
    id: "fees",
    title: "Delivery areas, fees and VAT",
    body: (
      <>
        <P>
          Because distances differ, our delivery fee depends on the area you choose. The fee, and any VAT that applies,
          are shown as separate lines in your order summary so you always see the full total before you pay. Where VAT
          applies, it is added to the price of the products.
        </P>
        <P>
          If your area is not in the list, please{" "}
          <Link href="/contact" className="font-semibold text-kb-green hover:underline">
            contact us
          </Link>{" "}
          and we will tell you whether we can deliver to you and at what cost.
        </P>
      </>
    ),
  },
  {
    id: "timing",
    title: "Delivery times",
    body: (
      <>
        <P>
          After you order, we contact you to confirm arrangements. When your order is on its way, or ready for pickup,
          we send you an email. Delivery times depend on your location, product availability, traffic and weather, so
          we cannot promise an exact time, but we will keep you informed.
        </P>
        <P>
          Someone should be available to receive the order. If we cannot reach you after reasonable attempts, we may
          rearrange delivery or cancel the order.
        </P>
      </>
    ),
  },
  {
    id: "paying",
    title: "Paying for your order",
    body: (
      <>
        <UL>
          <li>
            <strong>Pay now.</strong> You pay securely online through Paystack (card, bank transfer or USSD, depending
            on what Paystack offers you). Your order is confirmed when the payment succeeds. We never see or store your
            card details.
          </li>
          <li>
            <strong>Pay on delivery or at pickup.</strong> You pay when your order arrives or when you collect it. If
            you cancel before that, you have not been charged.
          </li>
        </UL>
        <P>
          Unpaid online orders are cancelled automatically after a few hours, and the items are released back to stock.
        </P>
      </>
    ),
  },
  {
    id: "cancelling",
    title: "Cancelling an order",
    body: (
      <>
        <P>
          Every confirmation email contains a private link to your order. Depending on where your order is, it works
          like this:
        </P>
        <UL>
          <li>
            <strong>Not yet processed.</strong> You can cancel straight away from the link. The items go back into
            stock, and if you had not paid, you are not charged.
          </li>
          <li>
            <strong>Paid online, not yet shipped.</strong> You can send us a cancellation request from the same link.
            We review it and email you. If we approve it, your payment is refunded (see below). If we have already
            prepared the order, we may not be able to approve it.
          </li>
          <li>
            <strong>Shipped or ready for pickup.</strong> The order can no longer be cancelled on the website. Please
            contact us, and we will do our best to help.
          </li>
        </UL>
        <P>
          We may also cancel an order ourselves, for example if an item is unavailable, a price was shown in error, or we
          cannot deliver to your area. If we do, we will tell you and refund any payment you made.
        </P>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds",
    body: (
      <>
        <P>You are refunded in these situations:</P>
        <UL>
          <li>we approve your request to cancel an order you already paid for;</li>
          <li>we cancel an order you paid for, or cannot supply it;</li>
          <li>
            an item arrives damaged, wrong or not as described, and after we look into it we agree a refund is the
            right solution (see the next section).
          </li>
        </UL>
        <Note>
          <strong>How refunds are paid.</strong> Refunds for online payments are sent back to the card or bank account
          you paid with, through Paystack. Once we have approved a refund, it can take several business days to show in
          your account, depending on your bank or card issuer. We will email you when we start the refund. Orders you pay
          for on delivery or at pickup are not charged until you receive them, so there is normally nothing to refund.
        </Note>
      </>
    ),
  },
  {
    id: "problems",
    title: "Damaged, wrong or missing items",
    body: (
      <>
        <P>
          Please check your order when it arrives. If anything is damaged, wrong, missing or not as described, contact us
          as soon as possible, ideally on the same day, and include your order number and a photo if you can. We will
          look into it and, where the problem is confirmed, we will replace the item, correct the order or refund the
          affected part.
        </P>
        <P>
          Fresh produce is a natural product, so size, shape and colour can vary from the pictures on the site. Because
          our products include fresh and perishable food, we do not normally accept returns for a change of mind once an
          order has been delivered or collected.
        </P>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your legal rights",
    body: (
      <P>
        Nothing in this policy limits any rights you have under Nigerian consumer protection law. If you are unhappy with
        how we have handled your order, please tell us so we can put it right.
      </P>
    ),
  },
];

export default function DeliveryAndRefundsPage() {
  return (
    <PolicyLayout
      title="Delivery & Refund Policy"
      description="How delivery and self pickup work, how to cancel an order, and how refunds are handled."
      updated="September 2026"
      sections={sections}
    />
  );
}
