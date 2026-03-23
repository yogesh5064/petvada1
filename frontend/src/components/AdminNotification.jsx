const AdminNotification = () => {
  const [msg, setMsg] = useState("");

  const handleSend = async () => {
    await axios.post('/api/notifications', { message: msg }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    alert("Notification Published!");
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg mb-6">
      <h3 className="font-bold mb-2">Send Public Announcement</h3>
      <input 
        className="border p-2 w-full mb-2" 
        placeholder="E.g. Clinic closed on Sunday..." 
        onChange={(e) => setMsg(e.target.value)}
      />
      <button onClick={handleSend} className="bg-red-600 text-white px-4 py-2 rounded">Publish</button>
    </div>
  );
};