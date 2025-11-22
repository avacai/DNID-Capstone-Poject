import { Redirect } from "expo-router";

export default function Index() {
  // always start at the onboarding loading screen
  return <Redirect href="/onboarding/loading" />;
}