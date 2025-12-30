import type { PreparedPictographData } from "$lib/shared/pictograph/option/PreparedPictographData";

export function stabilizePreparedOptions(
  prepared: PreparedPictographData[],
  cache: Map<string, PreparedPictographData>
) {
  const stabilized = prepared.map((p) => {
    const existing = cache.get(p.id);
    if (existing) {
      // ID exists - update the _prepared field on the existing object
      // This keeps the same object reference while updating the positions
      console.log(`?? [Cache] UPDATING ${p.letter} (id: ${p.id})`);
      existing._prepared = p._prepared;
      return existing;
    }

    // New ID - add to cache
    console.log(`?? [Cache] ADDING ${p.letter} (id: ${p.id})`);
    cache.set(p.id, p);
    return p;
  });

  // Clean cache of IDs no longer in the list
  const currentIds = new Set(prepared.map((p) => p.id));
  for (const [id, _] of cache) {
    if (!currentIds.has(id)) {
      console.log(`??? [Cache] REMOVING id: ${id}`);
      cache.delete(id);
    }
  }

  return stabilized;
}
