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