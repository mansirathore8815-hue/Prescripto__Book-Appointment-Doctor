import { useContext } from "react";
import { useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, setToken, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const validateForm = () => {
    if (state === "Sign Up") {
      if (!name.trim()) {
        toast.error("Please enter your name");
        return false;
      }
      if (name.trim().length < 3) {
        toast.error("Name must be at least 3 characters");
        return false;
      }
      
      if (!phone.trim()) {
        toast.error("Please enter your phone number");
        return false;
      }
      
      if (!/^\d{10}$/.test(phone.trim())) {
        toast.error("Phone number must be 10 digits");
        return false;
      }
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email");
      return false;
    }

    if (!password) {
      toast.error("Please enter your password");
      return false;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Normalize email: trim whitespace and convert to lowercase
      const normalizedEmail = email.trim().toLowerCase();

      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/user/register", {
          name: name.trim(),
          email: normalizedEmail,
          password,
          phone: phone.trim(),
        });

        if (data.success) {
          // Clear form fields
          setName("");
          setEmail("");
          setPassword("");
          setPhone("");
          
          // Set signup success flag to show modal
          setSignUpSuccess(true);
          
          // Show success message with instructions
          toast.success("✅ SUCCESS! Account Created", {
            autoClose: 5000,
            draggable: true,
          });
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            setState("Login");
            setSignUpSuccess(false);
            // Pre-fill email for convenience
            setEmail(normalizedEmail);
          }, 2000);
        } else {
          toast.error(data.message || "Failed to create account");
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/user/login", {
          email: normalizedEmail,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          // Clear form fields
          setEmail("");
          setPassword("");
          toast.success("✅ Logged in successfully!");
          // Redirect to home page after 1 second
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          toast.error(data.message || "Failed to log in");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-8 px-4">
      {/* Success Modal - Shows after sign up */}
      {signUpSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md text-center animate-bounce">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">Account Created Success!</h2>
            <p className="text-gray-700 mb-2">Your account has been created successfully.</p>
            <p className="text-gray-600 text-sm mb-6">Now you can login with your email and password.</p>
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-800">
                <strong>Next Step:</strong> Login with your credentials → Select a doctor → Book an appointment!
              </p>
            </div>
            <p className="text-gray-500 text-sm">Redirecting to login in a moment...</p>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {state === "Sign Up" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600">
            {state === "Sign Up"
              ? "Sign up to book your appointment"
              : "Login to manage your appointments"}
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={onSubmitHandler}
          className="bg-white border border-gray-200 rounded-xl shadow-lg p-8"
        >
          {/* Name Field (Only for Sign Up) */}
          {state === "Sign Up" && (
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                👤 Full Name *
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                type="text"
                placeholder="Enter your full name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required={state === "Sign Up"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 3 characters required
              </p>
            </div>
          )}

          {/* Phone Field (Only for Sign Up) */}
          {state === "Sign Up" && (
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                📱 Phone Number *
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                type="tel"
                placeholder="Enter your phone number"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                required={state === "Sign Up"}
              />
              <p className="text-xs text-gray-500 mt-1">
                10 digit phone number required
              </p>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              📧 Email Address *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the same email for login
            </p>
          </div>

          {/* Password Field */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              🔐 Password *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters required
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200 mb-4"
          >
            {loading
              ? "Processing..."
              : state === "Sign Up"
              ? "Create Account"
              : "Login"}
          </button>

          {/* Toggle State */}
          <div className="text-center border-t border-gray-200 pt-4">
            {state === "Sign Up" ? (
              <p className="text-gray-700">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setState("Login");
                    setName("");
                    setEmail("");
                    setPassword("");
                    setPhone("");
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Login here
                </button>
              </p>
            ) : (
              <p className="text-gray-700">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setState("Sign Up");
                    setEmail("");
                    setPassword("");
                    setPhone("");
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign up here
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Admin/Doctor Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-2">Are you a Doctor or Admin?</p>
          <a
            href="http://localhost:5174"
            className="text-blue-600 font-semibold hover:underline"
          >
            Go to Admin Portal →
          </a>
        </div>

        {/* Important Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> Use the same email and password for signing up and logging in
          </p>
        </div>

        {/* Process Flow Guide */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-5">
          <p className="text-sm font-bold text-gray-800 mb-3">📋 How to Book an Appointment:</p>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">1️⃣</span>
              <span><strong>Sign Up</strong> - Create your account with name, email & password</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">2️⃣</span>
              <span><strong>Login</strong> - Enter your email and password</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">3️⃣</span>
              <span><strong>Select Doctor</strong> - Browse doctors and click \"Book Appointment\"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">4️⃣</span>
              <span><strong>Choose Date & Time</strong> - Pick date from calendar and select time slot</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">5️⃣</span>
              <span><strong>Confirm Booking</strong> - Click \"Book Appointment\" button</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
