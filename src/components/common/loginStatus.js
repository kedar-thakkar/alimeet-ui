function CheckLoginStatus() {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return true;
  } else {
    return false;
  }
}

export default CheckLoginStatus;