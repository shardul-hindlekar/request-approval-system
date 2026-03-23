import { Chip } from "@mui/material";

interface Props {
    status: string;
}

export default function StatusChip({ status}: Props) {
    const color =
  status === "Approved" ? "success"
  : status === "Rejected" ? "error"
  : status === "PendingReview" ? "warning"
  : status === "PendingApproval" ? "info"
  : "default";

    return <Chip label={status} color={color} size="small" />;
}