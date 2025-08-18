import PaymentWidget from './PaymentWidget'

interface PaymentWidgetWrapperProps {
  checkoutId: string
  brand?: string | null
  integrity?: string | null
  nonce: string
}

export default function PaymentWidgetWrapper({ checkoutId, brand, integrity, nonce }: PaymentWidgetWrapperProps) {
  return <PaymentWidget checkoutId={checkoutId} brand={brand} integrity={integrity} nonce={nonce} />
}
