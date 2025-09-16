export default function Dashboard({ onLogout, email }) {
  return (
    <div>
      <h2>Login Successful!</h2>
      <p>Welcome, <strong>{email}</strong>!</p>
      <button onClick={onLogout}>Logout</button>
      {/* Next: Add PDF upload/view features here */}
    </div>
  );
}