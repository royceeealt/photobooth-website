const PROFILE_AVATAR_EVENT = "pixibooth-profile-avatar-change";

function storageKey(user) {
  return `pixibooth-profile-avatar:${user?.id || user?.email || "default"}`;
}

export function getProfileAvatar(user) {
  return localStorage.getItem(storageKey(user)) || "male";
}

export function setProfileAvatar(user, avatar) {
  localStorage.setItem(storageKey(user), avatar);
  window.dispatchEvent(new Event(PROFILE_AVATAR_EVENT));
}

export function subscribeToProfileAvatar(callback) {
  window.addEventListener(PROFILE_AVATAR_EVENT, callback);
  return () => window.removeEventListener(PROFILE_AVATAR_EVENT, callback);
}
