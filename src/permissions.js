export const isAdmin = (user) => user?.systemRole === "ADMIN";

export const canPrepare = (user) =>
  user?.systemRole === "PREPARER" || user?.systemRole === "ADMIN";

export const canReview = (user) =>
  user?.systemRole === "REVIEWER" || user?.systemRole === "ADMIN";

export const canApprove = (user) =>
  user?.systemRole === "APPROVER" || user?.systemRole === "ADMIN";

export const canEdit = (user) => user?.systemRole === "ADMIN";
