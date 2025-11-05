export default function About() {
  return (
    <main className="bg-neutral min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md">
        <header className="mb-6">
          <h1 className="text-dark text-3xl font-bold">About & Legal</h1>
          <p className="text-dark/70 mt-2">
            This site aggregates public product listings and prices from local pharmacies to help
            you compare supplements. We do not sell or ship products.
          </p>
        </header>

        {/* Plain language summary */}
        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">Quick summary</h2>
          <p className="text-dark/80">
            We collect publicly available product info from pharmacy websites so you can compare
            prices and find deals. The site is for informational purposes only — please verify
            product details and complete purchases on the pharmacy's website.
          </p>
        </section>

        {/* Formal disclaimer */}
        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">Disclaimer & legal notice</h2>

          <ul className="text-dark/80 list-inside list-disc space-y-3">
            <li>
              <strong>Data sources & ownership:</strong> Product listings, prices, images and
              descriptions are obtained from third‑party websites and APIs. We do not claim
              ownership of third‑party content.
            </li>

            <li>
              <strong>No sale / no agency:</strong> We do not sell products, accept payments, or act
              as an agent for any seller. Purchases must be completed on the merchant site.
            </li>

            <li>
              <strong>Accuracy & updates:</strong> We attempt to keep information current but cannot
              guarantee accuracy or availability. Always verify details on the source website prior
              to relying on them.
            </li>

            <li>
              <strong>AI assistance:</strong> AI‑generated suggestions and summaries are automated
              and may be inaccurate. They are not a substitute for professional advice.
            </li>

            <li>
              <strong>No warranty / limitation of liability:</strong> The site is provided "as is".
              To the maximum extent permitted by law, we disclaim all warranties and are not liable
              for damages arising from use of the site.
            </li>

            <li>
              <strong>Third‑party links & trademarks:</strong> Links and trademarks belong to their
              respective owners; we are not responsible for third‑party sites.
            </li>

            <li>
              <strong>Copyright / DMCA:</strong> If you believe your copyrighted work is used
              improperly, contact{' '}
              <a
                href="mailto:support@your-domain.com"
                className="text-accent"
              >
                support@your-domain.com
              </a>{' '}
              with a DMCA takedown request.
            </li>

            <li>
              <strong>Privacy:</strong> We collect limited analytics; we do not sell personal data.
              See our Privacy Policy for details and rights (GDPR/CCPA).
            </li>

            <li>
              <strong>Changes:</strong> We may update these terms; changes take effect when posted.
            </li>
          </ul>
        </section>

        {/* Contact / footer */}
        <section className="border-t border-neutral-100 pt-4">
          <p className="text-dark/70 text-sm">
            For corrections, takedown requests, or legal inquiries, email us at{' '}
            <a
              href="mailto:support@your-domain.com"
              className="text-accent font-medium"
            >
              support@your-domain.com
            </a>
            .
          </p>

          <p className="text-dark/60 mt-2 text-sm">
            Last updated:{' '}
            <time dateTime={new Date().toISOString()}>{new Date().toLocaleDateString()}</time>
          </p>
        </section>
      </div>
    </main>
  );
}
