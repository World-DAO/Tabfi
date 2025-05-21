import Image from "next/image";

export default function HomePage() {
  return (
    <div className="grotesk max-w-8xl mx-auto">
      {/* Hero Section */}
      <section className="w-full text-black">
        <div className="max-w-8xl mx-auto inline-block items-center p-3 pt-0 lg:flex lg:flex-wrap lg:pt-2 lg:my-10">
          <div className="lg:w-3/6">
            <h1 className="max-w-xl lg:text-[4.2em] text-3xl font-bold leading-none text-black inline-block">
              Tabfi -
              <br />
              Innovative Payment, Redefining Transactions
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold text-[#404040]">
              Tabfi offers a revolutionary payment method that enables users
              to purchase products by lending funds to merchants upfront.
              Merchants repay the equivalent amount within an agreed timeframe,
              transforming traditional transactions into a flexible financing
              experience.
            </p>
          </div>
          <div className="mb-10 mt-10 hidden w-full flex-col lg:mt-2 lg:inline-block lg:w-3/6">
            <Image
              src="/images/home.png"
              width={2048}
              height={1365}
              className="w-full h-auto"
              alt="PayFi"
            />
          </div>
          <div className="my-10 inline-block w-full flex-col lg:mt-0 lg:hidden lg:w-2/5">
            <Image
              src="/images/home.png"
              alt="PayFi"
              width={2048}
              height={1365}
            />
          </div>
        </div>

        {/* Introduction Content */}
        <div className="mt-0 bg-white lg:mt-20">
          <div className="mx-auto">
            <div className="mx-auto px-5 py-4 lg:px-24 lg:pt-24">
              <div className="my-4 flex w-full flex-col text-center">
                <h2 className="mb-5 text-2xl font-bold text-black lg:text-3xl">
                  Bringing Innovative Payment Solutions to Life
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-16">
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/Tabfi_logo.jpg"
                    width={160}
                    height={160}
                    alt="Logo"
                    className="block h-40 object-contain"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/overflow.png"
                    alt="EverMove"
                    width={160}
                    height={160}
                    className="block h-40 object-contain"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/CCTF.jpg"
                    alt="Icon"
                    width={160}
                    height={160}
                    className="block h-40 object-contain"
                  />
                </div>
              </div>

              <div className="mb-6 flex w-full flex-col text-center">
                <a
                  href="https://sightai.io/"
                  className="underline-blue mb-8 text-xl font-bold text-black"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>

          {/* Detailed Product Introduction */}
          <div className="text-black">
            <div className="max-w-9xl mx-auto flex flex-col items-center justify-center px-5">
              {/* New Payment Model */}
              <div className="mr-0 mb-6 w-full py-4 text-center lg:w-3/4">
                <div>
                  <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
                    New Payment Model
                  </h2>
                  <p className="mb-4 text-lg leading-relaxed">
                    Tabfi introduces a novel payment model where users can
                    purchase products by lending a predetermined amount of funds
                    to the merchant upfront. This innovative approach allows
                    users to receive the product immediately while the merchant
                    repays the same amount within a negotiated period,
                    transforming traditional cash transactions into a flexible
                    financing experience.
                  </p>
                </div>
                <div className="mt-4 w-full flex-col lg:mt-4 lg:inline-block lg:w-full">
                  <Image
                    src="/images/Work Flow.png"
                    alt="New Payment Model"
                    width={2640}
                    height={1238}
                    className="home-intro-image w-full h-auto"
                  />
                </div>
              </div>

              {/* Merchant Credit Evaluation System */}
              <div className="mr-0 mb-6 w-full py-4 text-center lg:w-3/4">
                <div>
                  <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
                    Merchant Credit Evaluation System
                  </h2>
                  <p className="mb-4 text-lg leading-relaxed">
                    Merchants register on the Tabfi platform and undergo a
                    comprehensive credit evaluation based on their transaction
                    volume, sales history, and existing assets. This credit
                    score determines their borrowing limit, and a portion of
                    their assets is held as collateral to ensure a secure
                    transaction environment.
                  </p>
                </div>
                <div className="mt-4 w-full flex-col lg:mt-4 lg:inline-block lg:w-full">
                  <Image
                    src="/images/AI Agent.png"
                    alt="Merchant Credit Evaluation"
                    width={1500}
                    height={742}
                    className="home-intro-image"
                  />
                </div>
              </div>

              {/* Smart Contract Automatic Management */}
              <div className="mr-0 mb-6 w-full py-4 text-center lg:w-2/3">
                <div>
                  <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
                    Smart Contract Automatic Management
                  </h2>
                  <p className="mb-4 text-lg leading-relaxed">
                    Once a transaction is confirmed, a smart contract
                    automatically governs the repayment process. When the agreed
                    repayment period expires, any outstanding funds are repaid
                    automatically, ensuring a secure, transparent, and efficient
                    settlement that minimizes risk for both users and merchants.
                  </p>
                </div>
                <div className="mb-10 mt-4 w-full flex-col lg:mt-4 lg:inline-block lg:w-full">
                  <Image
                    src="/images/smart contract.jpg"
                    alt="Smart Contract Management"
                    width={2048}
                    height={1365}
                    className="home-intro-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mx-auto px-5 pt-10 pb-8 lg:px-24 py-24">
          <div className="my-3 flex w-full flex-col text-left lg:text-center">
            <h2 className="bold mb-8 text-4xl font-bold leading-tight text-black lg:text-6xl">
              Discover the Future of Payment
            </h2>
          </div>
          <div className="flex w-full flex-col text-left lg:text-center">
            <h3 className="text-2xl text-black">
              Join us and experience the innovative payment solution offered by
              Tabfi.
            </h3>
          </div>
          <div className="flex w-full flex-row justify-center pt-24 text-center">
            <a
              href="/enroll"
              className="underline-blue px-8 text-xl font-semibold text-black"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Additional Content */}
        <div className="bg-white text-black">
          <div className="mx-auto mb-16 flex flex-col items-center px-5 pt-20 lg:flex-row">
            <div className=" flex flex-col text-left lg:mb-0 lg:w-1/2 lg:flex-grow lg:items-start">
              <h2 className="mb-4 text-4xl font-bold leading-none sm:text-5xl">
                A Future Built on Innovation and Trust
              </h2>
              <p className="font-3xl mb-8 font-semibold leading-relaxed">
                Tabfi is revolutionizing payment systems by integrating
                advanced credit scoring and automated repayment mechanisms to
                create a secure, efficient, and user-centric transaction
                platform.
              </p>
            </div>
            <div className="lg:w-full lg:max-w-2xl">
              <Image
                src="/images/future.png"
                alt="Future"
                width={2048}
                height={842}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
