import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import burgerImg from "../assets/bugers.png";
import cabbageImg from "../assets/cabbage.png";
import saladImg from "../assets/salad (3).png";
import tomatoImg from "../assets/tomatotes.png";

const scallopedWaveFlipped = (color = "#050A0A") =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 100'%3E%3Cg transform='matrix(1 0 0 -1 0 100)'%3E%3Cpath d='M0 0v60c9 0 18-3 25-10 13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s37 13 50 0c14-14 37-14 50 0 7 7 16 10 25 10V0H0Z' fill='${encodeURIComponent(
    color,
  )}'/%3E%3C/g%3E%3C/svg%3E")`;

function CustomerReview() {
  const [reviews] = useState([
    { id: 1, name: "Alex R.", rating: 5, text: "Best meal I've had in months. The portions are generous and everything tastes fresh." },
    { id: 2, name: "Jamie T.", rating: 4, text: "Great flavors, quick delivery. Will definitely order again." },
    { id: 3, name: "Morgan L.", rating: 5, text: "Consistently excellent. This is my go-to spot for takeout." },
    { id: 4, name: "Priya S.", rating: 5, text: "The packaging keeps everything hot and never leaks. Small detail, huge difference." },
    { id: 5, name: "Devon K.", rating: 4, text: "Solid variety on the menu and nothing has missed yet. Delivery windows are accurate too." },
    { id: 6, name: "Sam W.", rating: 5, text: "Ordered for a dinner party and every plate came back empty. Huge win." },
    { id: 7, name: "Casey B.", rating: 4, text: "Good value for the portion size. Only wish there were more vegetarian options." },
    { id: 8, name: "Riley P.", rating: 5, text: "Customer support fixed an order mix-up in minutes. That kind of service is rare." },
    { id: 9, name: "Taylor N.", rating: 5, text: "The seasoning is always spot on. My family requests this place every week." },
    { id: 10, name: "Jordan H.", rating: 4, text: "Reliable and tasty. Delivery ran a little late once but the food made up for it." },
    { id: 11, name: "Avery M.", rating: 5, text: "Best value takeout in the area, hands down. Never disappoints." },
    { id: 12, name: "Quinn D.", rating: 5, text: "Fresh ingredients you can actually taste. This has become our Friday tradition." },
    { id: 13, name: "Elliot F.", rating: 5, text: "Never had a cold delivery yet, even in winter. They've nailed the logistics." },
    { id: 14, name: "Harper G.", rating: 4, text: "App makes reordering past favorites really easy. Small thing that saves a lot of time." },
    { id: 15, name: "Micah J.", rating: 5, text: "Portion sizes are honest and the flavors punch above the price point." },
    { id: 16, name: "Nova C.", rating: 5, text: "Switched from three other services to this one and haven't looked back." },
  ]);

  const infiniteReviews = useMemo(() => [...reviews, ...reviews], [reviews]);

  return (
    <section className="relative overflow-hidden bg-white min-h-[600px] sm:min-h-[700px] md:min-h-[60dvh] py-12 sm:py-16 lg:py-20">
      {/* Decorative background produce — one per side */}
      <img
        src={burgerImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none  absolute -top-8 -left-8 z-1 w-24 sm:w-32 lg:w-44 -rotate-12 opacity-90 drop-shadow-xl"
      />
      <img
        src={tomatoImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-10 -right-10 z-1 w-28 sm:w-40 lg:w-56 rotate-[18deg] opacity-90 drop-shadow-xl"
      />
      <img
        src={saladImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-16 -left-6 z-2 w-28 sm:w-40 lg:w-52 -rotate-6 opacity-90 drop-shadow-xl"
      />
      <img
        src={cabbageImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-14 -right-4 z-2 w-24 sm:w-32 lg:w-44 rotate-[10deg] opacity-90 drop-shadow-xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 ">
        <div className="mb-14 text-center">
          <h2 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[0.08em] text-neutral-900">
            CUSTOMER REVIEWS
          </h2>

          <p className="section-label mt-3 text-neutral-500">
            WHAT PEOPLE ARE SAYING
          </p>
        </div>

        <div className="relative overflow-hidden">
          {/* Left Fade */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-28 bg-gradient-to-r from-white to-transparent" />

          {/* Right Fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-28 bg-gradient-to-l from-white to-transparent" />

          <div className="flex w-max animate-review-scroll gap-2 ">
            {infiniteReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="relative flex h-[230px] w-[320px] rounded-xl shrink-0 flex-col overflow-hidden border border-neutral-200 bg-[#FAFAF8] p-6 pb-20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < review.rating
                            ? "fill-lime-600 text-lime-600"
                            : "fill-none text-neutral-300"
                        }
                      />
                    ))}
                  </div>

                  <p className="flex-1 text-[15px] leading-7 text-neutral-700">
                    {review.text}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#556B2F] font-semibold text-white">
                      {review.name.charAt(0)}
                    </div>

                    <span className="text-xs font-semibold tracking-[0.2em] text-neutral-700">
                      {review.name.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div
                  className="absolute bottom-0 left-0 h-[40px] w-full"
                  style={{
                    backgroundImage: scallopedWaveFlipped("#556B2F"),
                    backgroundRepeat: "repeat-x",
                    backgroundSize: "auto 100%",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[100px] w-full"
        style={{
          backgroundImage: scallopedWaveFlipped("#050A0A"),
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
        }}
      />
    </section>
  );
}

export default CustomerReview;