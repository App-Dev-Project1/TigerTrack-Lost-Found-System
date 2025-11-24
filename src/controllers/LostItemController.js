// 1. Submit a new Lost Item Report
export const submitLostItemReport = async (formData) => {
  const response = await fetch('http://localhost:5000/api/items/lost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to submit report');
  }

  return result;
};

// 2. Fetch All Lost Items (for Admin Dashboard / Items View)
export const fetchLostItems = async () => {
  const response = await fetch('http://localhost:5000/api/items/lost', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch items');
  }

  return result;
};

// 3. Delete a Lost Item (for Admin Dashboard)
export const deleteLostItem = async (id) => {
  const response = await fetch(`http://localhost:5000/api/items/lost/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete item');
  }

  return result;
};