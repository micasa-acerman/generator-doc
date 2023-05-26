const input1 = document.getElementById('f-code-org');
const input2 = document.getElementById('f-code-parent-org');
const results1 = document.getElementById('f-code-org-autocomplete');
const results2 = document.getElementById('f-code-parent-org-autocomplete');


function initSelectControls(suggestions){
  function updateResults(input, results) {
    const searchTerm = input.value.toLowerCase();
    results.innerHTML = '';

    const filteredSuggestions = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm)
    );

    filteredSuggestions.forEach(suggestion => {
      const option = document.createElement('div');
      option.textContent = suggestion;
      option.classList.add('autocomplete-option');

      option.addEventListener('click', () => {
        input.value = suggestion;
        results.innerHTML = '';
      });

      results.appendChild(option);
    });
  }

  input1.addEventListener('input', updateResults.bind(this, input1, results1));
  input2.addEventListener('input', updateResults.bind(this, input2, results2));
}