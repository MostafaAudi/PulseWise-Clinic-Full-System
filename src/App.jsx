import React, { useMemo, useState } from "react";

const pages = [
  "Home",
  "Predict",
  "Appointments",
  "Payments",
  "Reviews",
  "Contacts",
  "About Us",
  "Login",
  "Register",
];

const doctors = [
  "Dr. Maya Haddad - Family Medicine",
  "Dr. Mohammed kadri - Cardiology",
  "Dr. Mostafa Audi - Nutrition",
  "Dr. Mohammad Al Kassem - Endocrinology",
];

const defaultPrediction = {
  age: 18,
  bmi: 24,
  systolic: 118,
  glucose: 91,
  cholesterol: 183,
  activity: "moderate",
  smoker: "no",
  familyHistory: "no",
};

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function predictHealthRisk(values) {
  let score = 0;
  const factors = [];

  const add = (points, label) => {
    score += points;
    if (points > 0) factors.push(label);
  };

  add(values.age >= 60 ? 18 : values.age >= 45 ? 10 : values.age >= 30 ? 4 : 0, "Age");
  add(values.bmi >= 30 ? 18 : values.bmi >= 25 ? 9 : values.bmi < 18.5 ? 5 : 0, "BMI");
  add(values.systolic >= 140 ? 18 : values.systolic >= 130 ? 11 : values.systolic >= 120 ? 5 : 0, "Blood pressure");
  add(values.glucose >= 126 ? 18 : values.glucose >= 100 ? 9 : 0, "Blood sugar");
  add(values.cholesterol >= 240 ? 16 : values.cholesterol >= 200 ? 8 : 0, "Cholesterol");
  add(values.activity === "low" ? 12 : values.activity === "moderate" ? 3 : 0, "Activity level");
  add(values.smoker === "yes" ? 15 : 0, "Smoking");
  add(values.familyHistory === "yes" ? 12 : 0, "Family history");

  const finalScore = Math.min(100, Math.round(score));
  return {
    score: finalScore,
    level: finalScore >= 65 ? "High" : finalScore >= 35 ? "Moderate" : "Low",
    factors: factors.length ? factors : ["No major risk factors from these values"],
  };
}

function App() {
  const [page, setPage] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState(() => load("pulsewise-users", []));
  const [currentUser, setCurrentUser] = useState(() => load("pulsewise-current-user", null));
  const [appointments, setAppointments] = useState(() => load("pulsewise-appointments", []));
  const [payments, setPayments] = useState(() => load("pulsewise-payments", []));
  const [reviews, setReviews] = useState(() => load("pulsewise-reviews", [
    { name: "Sara", rating: 5, text: "Easy to use and the appointment flow is clear." },
    { name: "Omar", rating: 1, text: "The prediction page falsed me and didnt get my flew." },
  ]));
  const [Alert, setAlert] = useState("");

  const persist = (key, setter) => (value) => {
    setter(value);
    save(key, value);
  };

  const setStoredUsers = persist("pulsewise-users", setUsers);
  const setStoredAppointments = persist("pulsewise-appointments", setAppointments);
  const setStoredPayments = persist("pulsewise-payments", setPayments);
  const setStoredReviews = persist("pulsewise-reviews", setReviews);

  const login = (email, password) => {
    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) {
      setAlert("Wrong email or password.");
      return false;
    }
    const safeUser = { name: user.name, email: user.email };
    setCurrentUser(safeUser);
    save("pulsewise-current-user", safeUser);
    setAlert(`Welcome back, ${user.name}.`);
    setPage("Home");
    return true;
  };

  const register = (user) => {
    if (users.some((item) => item.email === user.email)) {
      setAlert("This email already has an account.");
      return false;
    }
    const nextUsers = [...users, user];
    setStoredUsers(nextUsers);
    const safeUser = { name: user.name, email: user.email };
    setCurrentUser(safeUser);
    save("pulsewise-current-user", safeUser);
    setAlert("Account created successfully.");
    setPage("Home");
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("pulsewise-current-user");
    setAlert("You have logged out.");
  };

  const props = {
    currentUser,
    appointments,
    payments,
    reviews,
    addAppointment: (appointment) => {
      const next = [{ ...appointment, id: Date.now(), status: "Booked" }, ...appointments];
      setStoredAppointments(next);
      setAlert("Appointment booked successfully.");
    },
    addPayment: (payment) => {
      const next = [{ ...payment, id: Date.now(), status: "Paid" }, ...payments];
      setStoredPayments(next);
      setAlert("Payment completed successfully.");
    },
    addReview: (review) => {
      const next = [{ ...review, id: Date.now() }, ...reviews];
      setStoredReviews(next);
      setAlert("Review submitted. Thank you.");
    },
    setPage,
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage("Home")}>
          <span className="brand-mark">PW</span>
          <span>
            <strong>PulseWise Clinic</strong>
            <small>Health prediction and care portal</small>
          </span>
        </button>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)}>
          Menu
        </button>
        <nav className={menuOpen ? "nav open" : "nav"}>
          {pages.map((item) => (
            <button
              key={item}
              className={page === item ? "nav-item active" : "nav-item"}
              onClick={() => {
                setPage(item);
                setMenuOpen(false);
              }}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      {Alert && (
        <button className="notice" onClick={() => setAlert("")}>
          {Alert}
        </button>
      )}

      <main>
        {page === "Home" && <Home currentUser={currentUser} setPage={setPage} logout={logout} />}
        {page === "Predict" && <PredictionSystem />}
        {page === "Appointments" && <Appointments {...props} />}
        {page === "Payments" && <Payments {...props} />}
        {page === "Reviews" && <Reviews {...props} />}
        {page === "Contacts" && <Contacts />}
        {page === "About Us" && <About />}
        {page === "Login" && <Login login={login} setPage={setPage} />}
        {page === "Register" && <Register register={register} />}
      </main>
    </div>
  );
}

function Home({ currentUser, setPage, logout }) {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Complete React health platform</p>
          <h1>Predict risk, book care, pay online, and share your clinic experience.</h1>
          <p>
            PulseWise Clinic is a full frontend health system for patients. It includes account access,
            appointments, contact information, reviews, payment simulation, and a transparent health prediction tool.
          </p>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => setPage("Predict")}>Start Prediction</button>
            <button className="secondary-action" onClick={() => setPage("Appointments")}>Book Appointment</button>
          </div>
          <div className="session-card">
            {currentUser ? (
              <>
                <strong>Logged in as {currentUser.name}</strong>
                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <strong>You are browsing as a guest.</strong>
                <button onClick={() => setPage("Login")}>Login</button>
                <button onClick={() => setPage("Register")}>Register</button>
              </>
            )}
          </div>
        </div>
        <div className="dashboard-panel">
          <Metric label="Clinic services" value="4" />
          <Metric label="Prediction inputs" value="8" />
          <Metric label="Patient reviews" value={load("pulsewise-reviews", []).length} />
        </div>
      </section>
      <section className="stats-grid">
        <InfoCard title="Book appointments" text="Choose a doctor, date, time, and reason for visit." />
        <InfoCard title="Pay online" text="Simulate a card payment and keep a payment history." />
        <InfoCard title="Leave reviews" text="Submit ratings and comments that appear instantly." />
      </section>
    </>
  );
}

function PredictionSystem() {
  const [form, setForm] = useState(defaultPrediction);
  const result = useMemo(() => predictHealthRisk(form), [form]);
  const setField = (field, value) => {
    const numberFields = ["age", "bmi", "systolic", "glucose", "cholesterol"];
    setForm({ ...form, [field]: numberFields.includes(field) ? Number(value) : value });
  };

  return (
    <section className="split-layout">
      <form className="panel">
        <p className="eyebrow">Prediction system</p>
        <h1>Health risk prediction</h1>
        <div className="form-grid">
          <Field label="Age" type="number" value={form.age} onChange={(value) => setField("age", value)} />
          <Field label="Bmi" type="number" step="0.1" value={form.bmi} onChange={(value) => setField("bmi", value)} />
          <Field label="Systolic BP" type="number" value={form.systolic} onChange={(value) => setField("systolic", value)} />
          <Field label="Glucose" type="number" value={form.glucose} onChange={(value) => setField("glucose", value)} />
          <Field label="Cholesterol" type="number" value={form.cholesterol} onChange={(value) => setField("cholesterol", value)} />
          <label className="field">
            <span>Bt3mol ryada</span>
            <select value={form.activity} onChange={(event) => setField("activity", event.target.value)}>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="field">
            <span>Smoker</span>
            <select value={form.smoker} onChange={(event) => setField("smoker", event.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className="field">
            <span>Family History</span>
            <select value={form.familyHistory} onChange={(event) => setField("familyHistory", event.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
        </div>
      </form>
      <aside className="panel result-panel">
        <p className="eyebrow">Result</p>
        <div className={`score-badge ${result.level.toLowerCase()}`}>{result.score}/100</div>
        <h2>{result.level} Risk</h2>
        <p>This result is educational only and does not replace medical advice.</p>
        <div className="tag-list">
          {result.factors.map((factor) => <span key={factor}>{factor}</span>)}
        </div>
        <h3>Recommended actions</h3>
        <ul>
          <li>Track your readings and compare them over time.</li>
          <li>Discuss unusual results with a healthcare professional.</li>
          <li>Improve sleep, nutrition, movement, and follow-up habits.</li>
        </ul>
      </aside>
    </section>
  );
}

function Appointments({ currentUser, appointments, addAppointment, setPage }) {
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    doctor: doctors[0],
    date: "",
    time: "",
    reason: "",
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.date || !form.time || !form.reason) return;
    addAppointment(form);
    setForm({ ...form, date: "", time: "", reason: "" });
  };

  return (
    <section className="split-layout">
      <form className="panel" onSubmit={submit}>
        <p className="eyebrow">Appointments</p>
        <h1>Book an appointment</h1>
        <div className="form-grid">
          <Field label="Patient name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
          <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
          <label className="field">
            <span>Doctor</span>
            <select value={form.doctor} onChange={(event) => setForm({ ...form, doctor: event.target.value })}>
              {doctors.map((doctor) => <option key={doctor}>{doctor}</option>)}
            </select>
          </label>
          <Field label="Date" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
          <Field label="Time" type="time" value={form.time} onChange={(value) => setForm({ ...form, time: value })} />
          <label className="field wide">
            <span>Reason for visit</span>
            <textarea rows="4" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
          </label>
        </div>
        <button className="primary-action">Confirm Appointment</button>
      </form>
      <aside className="panel">
        <h2>Your appointments</h2>
        {appointments.length === 0 && <p>No appointments yet.</p>}
        {appointments.map((item) => (
          <article className="record" key={item.id}>
            <strong>{item.doctor}</strong>
            <span>{item.date} at {item.time}</span>
            <p>{item.reason}</p>
            <button onClick={() => setPage("Payments")}>Pay Visit Fee</button>
          </article>
        ))}
      </aside>
    </section>
  );
}

function Payments({ payments, addPayment }) {
  const [form, setForm] = useState({ name: "", service: "Consultation Fee", amount: "25", card: "" });

  const submit = (event) => {
    event.preventDefault();
    if (!form.name || !form.amount || form.card.length < 4) {
      alert("Please fill in all fields.");
      return;
    }
    addPayment({ ...form, card: `**** ${form.card.slice(-4)}` });
    setForm({ name: "", service: "Consultation Fee", amount: "25", card: "" });
  };
  function service(value) {
  if (value === "Consultation Fee") {
    setForm({ ...form, service: value, amount: "20" });
  } else if (value === "Nutrition Plan") {
    setForm({ ...form, service: value, amount: "120" });
  } else if (value === "Follow-up Visit") {
    setForm({ ...form, service: value, amount: "15" });
  } else if (value === "Health Screening") {
    setForm({ ...form, service: value, amount: "150" });
  }
}
  return (
    <section className="split-layout">
      <form className="panel" onSubmit={submit}>
        <p className="eyebrow">Payments</p>
        <h1>Pay clinic fees</h1>
        <Field label="Cardholder name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <label className="field">
          
          <span>Service</span>
          <select value={form.service}onChange={(event) => { setForm({ ...form, service: event.target.value }); service(event.target.value);}}>
            <option value="Consultation Fee">Consultation Fee</option>
            <option value="Nutrition Plan">Nutrition Plan</option>
            <option value="Follow-up Visit">Follow-up Visit</option>
            <option value="Health Screening">Health Screening</option>
          </select>
       
        </label>
        <Field label="Amount USD" type="number" value={form.amount}  />
        <Field label="Card number" value={form.card} onChange={(value) => setForm({ ...form, card: value })} />
        <button className="primary-action">Pay Now</button>
      </form>
      <aside className="panel">
        <h2>Payment history</h2>
        {payments.length === 0 && <p>No payments yet.</p>}
        {payments.map((item) => (
          <article className="record" key={item.id}>
            <strong>{item.service}</strong>
            <span>${item.amount} - {item.status}</span>
            <p>{item.name} paid with card {item.card}</p>
          </article>
        ))}
      </aside>
    </section>
  );
}

function Reviews({ reviews, addReview, currentUser }) {
  const [form, setForm] = useState({ name: currentUser?.name ?? "", rating: "0", text: "" });

  const submit = (event) => {
    event.preventDefault();
    if (!form.name || !form.text) {
      alert("Please fill in all fields.");
      return;
    }
    addReview({ ...form, rating: Number(form.rating) });
    setForm({ ...form, text: "" });
  };

  return (
    <section className="split-layout">
      <form className="panel" onSubmit={submit}>
        <p className="eyebrow">Reviews</p>
        <h1>Leave a review</h1>
        <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <label className="field">
          <span>Rating</span>
          <select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })}>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
            <option value="0">0 star</option>
          </select>
        </label>
        <label className="field">
          <span>Review</span>
          <textarea rows="5" value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} />
        </label>
        <button className="primary-action">Submit Review</button>
      </form>
      <aside className="panel">
        <h2>Patient reviews</h2>
        {reviews.map((item, index) => (
          <article className="record" key={item.id ?? index}>
            <strong>{item.name}</strong>
            <span>{"*".repeat(item.rating)} ({item.rating}/5)</span>
            <p>{item.text}</p>
          </article>
        ))}
      </aside>
    </section>
  );
}

function Contacts() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <section className="content-section">
      <p className="eyebrow">Contacts</p>
      <h1>Contact PulseWise Clinic</h1>
      <div className="contact-grid">
        <InfoCard title="Phone" text={ <> +961 81 141 587 <br /> +961 81 984 929 </> } />
        <InfoCard title="Email" text={<>m.awdi797@gmail.com <br /> 32430767@students.liu.edu.lb</>} />
        <InfoCard title="Address" text="Saida Digital Health Center, Lebanon" />
      </div>
      <form className="panel contact-form" onSubmit={(event) => event.preventDefault()}>
        <Field label="Your name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <label className="field">
          <span>Message</span>
          <textarea rows="5" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
        </label>
        <button type="submit" className="primary-action">Send Message</button>
      </form>
    </section>
  );
}

function About() {
  return (
    <section className="content-section">
      <p className="eyebrow">About us</p>
      <h1>A Clinic to predict Your Health</h1>
      <p>
        PulseWise Clinic is a system to predicit your health risk based on common health indicators, book appointments,
         simulate payments, and share reviews.  
         The health prediction tool uses a simple scoring algorithm to provide an educational risk assessment based on user inputs.
      </p>
      <div className="stats-grid">
        <InfoCard title="Mission" text="Help patients understand basic health indicators and access care faster." />
        <InfoCard title="System design" text="React components, state management, local storage, forms, and responsive CSS." />
        <InfoCard title="Disclaimer" text="Prediction results are educational and not a professional diagnosis." />
      </div>
    </section>
  );
}

function Login({ login, setPage }) {
  const [form, setForm] = useState({ email: "", password: "" });
  return (
    <form className="auth-card" onSubmit={(event) => {
      event.preventDefault();
      login(form.email, form.password);
    }}>
      <p className="eyebrow">Login</p>
      <h1>Welcome back</h1>
      <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
      <Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
      <button className="primary-action">Login</button>
      <button type="button" className="text-action" onClick={() => setPage("Register")}>Create a new account</button>
    </form>
  );
}

function Register({ register }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  return (
    <form className="auth-card" onSubmit={(event) => {
      event.preventDefault();
      if (form.name && form.email && form.password) register(form);
    }}>
      <p className="eyebrow">Register</p>
      <h1>Create account</h1>
      <Field label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
      <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
      <Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
      <Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
      <button className="primary-action">Register</button>
    </form>
  );
}

function Field({ label, value = "", onChange = () => {}, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <article className="info-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export default App;
