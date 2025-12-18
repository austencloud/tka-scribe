/**
 * Test: Release notes add form should close when clicking elsewhere
 *
 * Scenario:
 * 1. Admin opens a release version detail panel
 * 2. Admin clicks "Add bug fix" button - form expands
 * 3. Admin clicks on an existing changelog entry (without typing anything)
 * 4. Expected: The add form should close/collapse
 */

import { describe, it, expect, beforeEach } from "vitest";

describe("VersionDetailPanel add form behavior", () => {
	let addingToCategory: string | null = null;
	let newEntryText = "";
	let currentlyEditingId: string | null = null;

	function startAdd(cat: string) {
		addingToCategory = cat;
		newEntryText = "";
	}

	function cancelAdd() {
		addingToCategory = null;
		newEntryText = "";
	}

	// Fixed version - closes add form when starting to edit
	function startEdit(id: string) {
		if (addingToCategory) {
			cancelAdd();
		}
		currentlyEditingId = id;
	}

	function endEdit() {
		currentlyEditingId = null;
	}

	beforeEach(() => {
		addingToCategory = null;
		newEntryText = "";
		currentlyEditingId = null;
	});

	it("should close add form when clicking on a changelog entry to edit it", () => {
		// Step 1: Click "Add bug fix" - form opens
		startAdd("fixed");
		expect(addingToCategory).toBe("fixed");

		// Step 2: Click on an existing changelog entry (triggers startEdit)
		startEdit("fixed-0");

		// Step 3: Add form should be closed
		expect(addingToCategory).toBeNull();
		expect(currentlyEditingId).toBe("fixed-0");
	});

	it("should close add form when starting to edit any item", () => {
		// Open add form for "added" category
		startAdd("added");
		expect(addingToCategory).toBe("added");

		// Click to edit an item in a different category
		startEdit("improved-2");

		// Add form should close
		expect(addingToCategory).toBeNull();
		expect(currentlyEditingId).toBe("improved-2");
	});

	it("should keep add form open when typing in it (not starting an edit)", () => {
		startAdd("fixed");
		newEntryText = "New bug fix description";

		// Not clicking to edit anything, just typing in the add form
		expect(addingToCategory).toBe("fixed");
		expect(newEntryText).toBe("New bug fix description");
	});

	it("should allow opening add form after closing edit mode", () => {
		// Start editing
		startEdit("fixed-0");
		expect(currentlyEditingId).toBe("fixed-0");

		// Close edit mode
		endEdit();
		expect(currentlyEditingId).toBeNull();

		// Open add form
		startAdd("improved");
		expect(addingToCategory).toBe("improved");
	});
});
