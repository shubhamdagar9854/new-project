// Signup form submit
document.querySelector('#signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    username: document.querySelector('#username').value,
    email: document.querySelector('#email').value,
    fullName: document.querySelector('#fullName').value,
    password: document.querySelector('#password').value,
    userType: document.querySelector('#userType').value // YE ADD KIYA

  };
  
  const response = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  alert(data.message);
});