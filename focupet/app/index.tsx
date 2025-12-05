import { Redirect } from "expo-router";

export default function Index() {
  // Send the user to login when the app loads
  return <Redirect href="/login" />;
}
