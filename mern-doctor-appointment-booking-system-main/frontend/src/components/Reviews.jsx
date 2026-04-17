import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Reviews = () => {
  const { backendUrl, token } = useContext(AppContext);
  const { docId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  const getReviews = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/get-doctor-reviews", {
        docId,
      });
      if (data.success) {
        setReviews(data.reviews);
        setAvgRating(data.averageRating);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login to add a review");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/add-review",
        {
          docId,
          rating,
          review: reviewText,
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Review added successfully!");
        setReviewText("");
        setRating(5);
        getReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReviews();
  }, [docId]);

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Rating Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Reviews & Ratings</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{avgRating}</div>
              <div className="text-yellow-400">★ ★ ★ ★</div>
              <div className="text-sm text-gray-600">Based on {reviews.length} reviews</div>
            </div>
          </div>
        </div>

        {/* Add Review Form */}
        {token && (
          <div className="bg-white border rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Add Your Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition ${
                        star <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="border border-zinc-300 rounded w-full p-3 h-24"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <div className="text-yellow-400">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.review}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
