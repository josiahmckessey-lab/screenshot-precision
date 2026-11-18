import { queryOptions } from "@tanstack/react-query";

import { getMyProfile } from "@/lib/account.functions";

export const profileQuery = queryOptions({
  queryKey: ["my-profile"],
  queryFn: () => getMyProfile(),
});
