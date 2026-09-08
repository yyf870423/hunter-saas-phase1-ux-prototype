import { candidates } from "./data.js";

const reviewedAssetIds = {
  "candidate-1": "candidate-linhao",
  "candidate-2": "candidate-zhoumingyuan",
  "candidate-3": "candidate-zhaoxingyu",
  "candidate-4": "candidate-chenchuning",
};

// Explicit fixture identities; names alone never establish a candidate link.
export const sourcingCandidates = candidates.map((person) => ({
  ...person,
  reviewId: person.id,
  id: reviewedAssetIds[person.id] || "sourcing-" + person.id,
  title: person.role,
  location: person.city,
  assetPath: reviewedAssetIds[person.id]
    ? "/candidates/" + reviewedAssetIds[person.id]
    : "",
}));
