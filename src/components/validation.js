const ValidateEmail = (email) => {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
    return { status: true }
  }
  return ({ status: false, error: "유효한 이메일 주소를 입력하십시오." })
}


const ValidateUsername = (username) => {

  if (username.length >= 2) {
    return { status: true };
  } else {
    return { status: false, error: "이름을 입력하십시오." };
  }
  // return { status: true };
}


const ValidatePassword = (password) => {

  // if (password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,32}$/)) {
  //   return { status: true };
  // } else {
  //   return { status: false, error: "One Uppercase , One Lowercase, One Number required " };
  // }

  if (password.length > 0) {
    return { status: true };
  } else {
    return ({ status: false, error: "올바른 암호를 입력하십시오. " });
  }

 

  // return { status: true };

}


const ValidateRole = (role) => {

  if (role.length > 0) {
    return { status: true };
  } else {
    return { status: false, error: "역할을 선택하십시오." };
  }

}

const ValidateMeetingTitle = (MeetingTitle) => {
  if (MeetingTitle.length > 0) {
    return { status: true };
  } else {
    return { status: false, error: "회의 제목 입력." };
  }
}

const Validateinvites = (meetingInvities) => {
  if (meetingInvities > 0) {
    return { status: true };
  } else {
    return { status: false, error: "학생을 추가하십시오." };
  }
}

export { ValidateEmail, ValidateUsername, ValidatePassword, ValidateRole ,ValidateMeetingTitle ,Validateinvites};