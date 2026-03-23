const BookingForm = () => {
  const [booking, setBooking] = useState({ petId: '', date: '', reason: 'Treatment' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/appointments/book', booking, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    alert("Request Sent! Wait for Admin confirmation.");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <label>Select Pet</label>
      <select className="w-full border p-2 mb-4" onChange={(e) => setBooking({...booking, petId: e.target.value})}>
        {/* Pets fetched from DB map here */}
        <option>Choose Pet</option>
      </select>

      <label>Appointment Date</label>
      <input type="datetime-local" className="w-full border p-2 mb-4" 
        onChange={(e) => setBooking({...booking, date: e.target.value})} />

      <button className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold">Confirm Booking</button>
    </form>
  );
};