import { useState } from 'react';
import './App.css';
import pizza from './assets/pizza.svg';
import { useNavigate } from 'react-router-dom';
import { useSeller } from './SellerContext';
import { useCart } from './CartContext';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');

function App() {
  const registerDefaults = {
    username: '',
    password: '',
    full_name: '',
    address: '',
    contact_number: '',
    email_address: '',
    role: 'buyer',
    shop_name: '',
    image: '',
  };
  const loginDefaults = { username: '', password: '' };

  const [showRegister, setShowRegister] = useState(false);
  const [submittedUsername, setSubmittedUsername] = useState('');
  const { setIsSeller } = useSeller();
  const { loadCart } = useCart();
  const [formData, setFormData] = useState({ ...registerDefaults });
  const [loginForm, setLoginForm] = useState({ ...loginDefaults });
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleLoginChange = ({ target: { name, value } }) => {
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setSubmittedUsername(formData.username);
    alert('Registration successful! (demo)');
    setShowRegister(false);
    setFormData({ ...registerDefaults });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!loginForm.username || !loginForm.password) {
      alert('Enter a username and password to continue.');
      return;
    }

    setIsSeller(true);
    localStorage.setItem('role', 'seller');
    localStorage.setItem('username', loginForm.username);
    loadCart();
    navigate('/MainPage');
    setLoginForm({ ...loginDefaults });
  };

  return (
    <div className="login">
      <div className="loginbg">
        <div className="loginbgimg">
          <div className="rotating-container">
            <img src={pizza} className="pizzaimg" />
            <svg className="circular-text-svg" viewBox="0 0 500 500">
              <path
                id="circlePath"
                d="M 250, 250 m -200, 0 a 200,200 0 1,1 400,0 a 200,200 0 1,1 -400,0"
              ></path>
              <text>
                <textPath href="#circlePath" startOffset="50%">
                  Hot & Fresh • Baked with Love • Slice into Happiness • Hot & Fresh • Baked with Love • Slice in •
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        <div className="loginform">
          {showRegister ? (
            <>
              <h1 className="logintext text2">
                Register
                {submittedUsername && (
                  <span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>
                    ({submittedUsername})
                  </span>
                )}
              </h1>

              <form onSubmit={handleRegister}>
                <div className="float-label" data-placeholder="Email Address">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.email_address}
                    name="email_address"
                    onChange={handleChange}
                  />
                </div>

                <div className="float-label" data-placeholder="Username">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.username}
                    name="username"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="float-label" data-placeholder="Password">
                  <input
                    type="password"
                    placeholder=""
                    value={formData.password}
                    name="password"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="float-label" data-placeholder="Full Name">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.full_name}
                    name="full_name"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="float-label" data-placeholder="Address">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.address}
                    name="address"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="float-label" data-placeholder="Contact Number">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.contact_number}
                    name="contact_number"
                    onChange={handleChange}
                    required
                  />
                </div>

                <button id="submitbtn" type="submit">Register</button>
                <span className="regtext">
                  Already have an account?
                  <button
                    id="regbtn"
                    type="button"
                    onClick={() => setShowRegister(false)}
                  >
                    Login here!
                  </button>
                </span>
              </form>
            </>
          ) : (
            <>
              <h1 className="logintext">Login</h1>
              <form onSubmit={handleLogin}>
                <div className="float-label" data-placeholder="Username">
                  <input
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    type="text"
                    placeholder=""
                  />
                </div>

                <div className="float-label2" data-placeholder="Password">
                  <input
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    type="password"
                    placeholder=""
                  />
                </div>

                <button id="submitbtn" type="submit">Login</button>
                <span className="regtext">
                  Don't have an account yet?
                  <button
                    id="regbtn"
                    type="button"
                    onClick={() => setShowRegister(true)}
                  >
                    Register here!
                  </button>
                </span>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
