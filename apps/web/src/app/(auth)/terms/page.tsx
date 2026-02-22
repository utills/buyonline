export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>

        <div className="prose prose-sm text-gray-600 space-y-4">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Introduction</h2>
            <p>
              Welcome to BuyOnline by Prudential Health Insurance. By accessing and using this
              platform, you agree to comply with and be bound by the following terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Eligibility</h2>
            <p>
              To purchase health insurance through BuyOnline, you must be at least 18 years of age
              and a resident of India. The policy covers individuals between the ages of 18 and 65
              for adult members, and children between 91 days and 25 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Policy Coverage</h2>
            <p>
              The health insurance policy provides coverage for hospitalization expenses,
              pre and post hospitalization expenses, day care procedures, and other benefits
              as specified in the policy document.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Premium Payment</h2>
            <p>
              Premium must be paid in full before the commencement of the policy. The premium
              amount is determined based on the age of members, sum insured selected, and
              policy tenure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Waiting Period</h2>
            <p>
              A waiting period of 30 days applies from the date of policy inception for all
              illnesses except accidental injuries. Specific diseases may have a longer waiting
              period of up to 48 months as specified in the policy document.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Disclosure</h2>
            <p>
              The proposer must disclose all material facts truthfully. Non-disclosure or
              misrepresentation of any material fact may lead to cancellation of the policy
              and denial of claims.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Data Privacy</h2>
            <p>
              By using BuyOnline, you consent to the collection, storage, and processing of
              your personal data for the purpose of underwriting, policy issuance, and claims
              processing. Your data is handled in accordance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Contact</h2>
            <p>
              For any queries or grievances, please contact our customer support at
              support@prudential.in or call 1800-XXX-XXXX (toll-free).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
