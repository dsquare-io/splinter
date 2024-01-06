import {FileRoute} from '@tanstack/react-router';

export const Route = new FileRoute('/profile/me').createRoute({
  component: MyProfile,
});

function MyProfile() {
  return (
    <div>My Profile</div>
  )
}
