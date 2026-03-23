const PetHistory = ({ petId }) => {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await axios.get(`/api/pets/${petId}/health`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory(data);
    };
    fetchHistory();
  }, [petId]);

  if (!history) return <p>Loading records...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-bold text-blue-800">🏥 Last Visit Details</h4>
        <p>Date: {new Date(history.lastVisit).toLocaleDateString()}</p>
        <p>Treatment: Vaccination & General Checkup</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-3 rounded">
          <p className="text-xs text-gray-500 uppercase">Vaccination</p>
          <p className="font-semibold">{history.vaccinationRecord[0]?.vaccineName || "N/A"}</p>
        </div>
        <div className="border p-3 rounded">
          <p className="text-xs text-gray-500 uppercase">Next Due</p>
          <p className="font-semibold text-red-600">{new Date(history.vaccinationRecord[0]?.nextDue).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};