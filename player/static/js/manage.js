async function deleteSong(name, songId) {
	if (confirm(`Are you sure you want to delete ${name}?`) !== true)
		return false;

	res = await fetch(`/songs/${songId}`, { method: 'DELETE' })
	if (!res.ok)
		alert('Error')
	location.reload()
}