/* Interactive demo question — mirrors the in-app practice UI */
(function () {
  var root = document.getElementById("demo-quiz");
  if (!root) return;

  var data;
  try {
    data = JSON.parse(root.getAttribute("data-question"));
  } catch (e) {
    return;
  }
  if (!data || !data.options) return;

  var answered = false;
  var letters = ["A", "B", "C", "D"];

  function render() {
    var optsHtml = data.options
      .map(function (opt, i) {
        return (
          '<button class="demo-quiz__opt" data-i="' +
          i +
          '">' +
          "<span>" +
          letters[i] +
          ") " +
          opt.text +
          "</span>" +
          '<span class="mark"></span>' +
          "</button>"
        );
      })
      .join("");

    root.innerHTML =
      '<div class="demo-quiz__bar">' +
      '<span class="demo-quiz__close">&times;</span>' +
      '<span class="demo-quiz__label">Practice · Question 1 of 5</span>' +
      "</div>" +
      '<div class="demo-quiz__dots">' +
      '<span class="demo-quiz__dot is-current"></span>' +
      '<span class="demo-quiz__dot"></span>' +
      '<span class="demo-quiz__dot"></span>' +
      '<span class="demo-quiz__dot"></span>' +
      '<span class="demo-quiz__dot"></span>' +
      "</div>" +
      '<div class="demo-quiz__body">' +
      (data.passage
        ? '<div class="demo-quiz__passage">' + data.passage + "</div>"
        : "") +
      '<p class="demo-quiz__q">' + data.question + "</p>" +
      '<div class="demo-quiz__opts">' + optsHtml + "</div>" +
      '<div class="demo-quiz__feedback" id="demo-quiz-feedback"></div>' +
      "</div>" +
      '<div class="demo-quiz__footer">' +
      '<button class="demo-quiz__next" id="demo-quiz-next">Next question</button>' +
      "</div>";

    root.querySelectorAll(".demo-quiz__opt").forEach(function (btn) {
      btn.addEventListener("click", onSelect);
    });
    var next = document.getElementById("demo-quiz-next");
    next.addEventListener("click", function () {
      // Reset for a replay of the demo
      answered = false;
      render();
    });
  }

  function onSelect(e) {
    if (answered) return;
    answered = true;
    var chosen = parseInt(e.currentTarget.getAttribute("data-i"), 10);
    var correctIdx = data.correct;
    var btns = root.querySelectorAll(".demo-quiz__opt");

    btns.forEach(function (btn, i) {
      btn.disabled = true;
      var mark = btn.querySelector(".mark");
      if (i === correctIdx) {
        btn.classList.add("correct");
        mark.textContent = "✓";
      } else if (i === chosen) {
        btn.classList.add("wrong");
        mark.textContent = "✗";
      } else {
        btn.classList.add("dimmed");
      }
    });

    var isCorrect = chosen === correctIdx;
    var fb = document.getElementById("demo-quiz-feedback");
    fb.className = "demo-quiz__feedback show " + (isCorrect ? "correct" : "wrong");
    fb.innerHTML =
      "<strong>" +
      (isCorrect ? "✓ Correct" : "✗ Incorrect") +
      "</strong>" +
      (isCorrect ? data.explanationCorrect : data.explanationWrong);

    // Update progress dot
    var dot = root.querySelector(".demo-quiz__dot.is-current");
    if (dot) {
      dot.classList.remove("is-current");
      dot.classList.add(isCorrect ? "is-correct" : "is-wrong");
      dot.textContent = isCorrect ? "✓" : "✗";
    }

    var next = document.getElementById("demo-quiz-next");
    next.classList.add("ready");
    next.textContent = "Try again";
  }

  render();
})();
