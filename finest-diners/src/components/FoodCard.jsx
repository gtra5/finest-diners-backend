import { useCart } from "../context/CartContext";

const StarRating = ({ rating = 0, max = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <span
        key={i}
        style={{
          color: i < Math.round(rating) ? "#c8f135" : "#2a2a2a",
          fontSize: 10,
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const FoodCard = ({ food, restaurantId }) => {
  const { addItem } = useCart();

  return (
    <div
      className="border card-hover border border-neutral-800 overflow-hidden border-neutral-800 overflow-hidden transition-all duration-200 hover:border-neutral-600"
      style={{ background: "#131313", fontFamily: "'Courier New', monospace" }}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={
            food.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={food.name}
          className="w-full object-cover"
          style={{ height: 160 }}
        />
        {!food.isAvailable && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 font-mono font-bold bg-neutral-900 text-neutral-500">
            UNAVAILABLE
          </span>
        )}
        {food.isAvailable && food.tag && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 font-mono font-bold bg-lime-400 text-black">
            {food.tag}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Ref + Price */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-neutral-500 text-xs tracking-wider uppercase">
            {food.category || "DISH"}
          </span>
          <div className="text-right">
            {food.oldPrice && (
              <span className="block text-neutral-600 text-xs line-through">
                ${food.oldPrice.toFixed(2)}
              </span>
            )}
            <span
              className="text-xs font-mono font-semibold"
              style={{ color: "#c8f135" }}
            >
              ${food.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="hero-title font-bold text-base text-white leading-tight mb-3 whitespace-pre-line">
          {food.name}
        </h3>
        {/* Stars */}
        <div className="flex items-center gap-2 mb-4">
          <StarRating rating={food.rating || 0} />
          <span className="text-neutral-600 text-xs">
            {food.reviewCount
              ? `${food.reviewCount} reviews`
              : "No reviews yet"}
          </span>
        </div>

        {/* Button */}
        {food.isAvailable ? (
          <button
            onClick={() => addItem(food, restaurantId)}
            className="w-full border border-neutral-700 text-xs tracking-widest py-2.5 transition-colors hover:text-lime-400 text-neutral-400"
            style={{ ":hover": { borderColor: "#c8f135" } }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#c8f135";
              e.currentTarget.style.color = "#c8f135";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.color = "";
            }}
          >
            ADD TO CART
          </button>
        ) : (
          <button
            disabled
            className="w-full border border-neutral-800 text-xs tracking-widest py-2.5 text-neutral-700 cursor-not-allowed"
          >
            UNAVAILABLE
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
