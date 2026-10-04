let notes = [
{ id: 1, text: "Buy milk and bread", category: "personal" },
{ id: 2, text: "Finish the Day 3 assignment", category: "study" },
{ id: 3, text: "Email the project report to Grace", category: "work" },
{ id: 4, text: "Revise JavaScript arrays", category: "study" },
{ id: 5, text: "Call mum", category: "personal" },
];

// 1. Search notes
function searchNotes(word) {
const searchWord = word.toLowerCase();

return notes.filter((note) =>
note.text.toLowerCase().includes(searchWord)
);
}

// 2. Find the longest note
function longestNote() {
if (notes.length === 0) {
return null;
}

return notes.reduce((longest, note) => {
return note.text.length > longest.text.length ? note : longest;
});
}

// 3. Count notes by category
function countByCategory() {
const counts = {
personal: 0,
work: 0,
study: 0,
};

notes.forEach((note) => {
if (counts[note.category] !== undefined) {
counts[note.category]++;
}
});

return counts;
}

// 4. Get a summary
function getSummary() {
const counts = countByCategory();
const total = notes.length;

return ${total} notes: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.;
}

// 5. Check for duplicate notes
function isDuplicate(text) {
const normalizedText = text.trim().replace(/\s+/g, " ").toLowerCase();

return notes.some((note) => {
const existingText = note.text
.trim()
.replace(/\s+/g, " ")
.toLowerCase();

return existingText === normalizedText;


});
}

// 6. Add a new note
function addNote(text, category) {
const cleanText = text.trim();
const validCategories = ["personal", "work", "study"];

if (cleanText.length < 1 || cleanText.length > 200) {
console.log("Note must be between 1 and 200 characters.");
return false;
}

if (isDuplicate(cleanText)) {
console.log("Note is a duplicate.");
return false;
}

if (!validCategories.includes(category)) {
console.log("Invalid category.");
return false;
}

const newId =
notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1;

notes.push({
id: newId,
text: cleanText,
category: category,
});

return true;
}

// Tests

console.log("Search 'day':", searchNotes("day"));

console.log("Longest note:", longestNote());

console.log("Count by category:", countByCategory());

console.log("Summary:", getSummary());

console.log("Duplicate 'call mum':", isDuplicate(" CALL MUM "));

console.log("Add valid note:", addNote("Practice JavaScript functions", "study"));

console.log("Notes after adding:", notes);

console.log("Add duplicate:", addNote(" Practice JavaScript functions ", "study"));

console.log("Add invalid category:", addNote("Go shopping", "other"));

console.log("Add empty note:", addNote("", "personal"));