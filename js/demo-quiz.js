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

  var letters = ["A", "B", "C", "D"];
  var selected = null;
  var checked = false;

  function render() {
    selected = null;
    checked = false;

    var optsHtml = data.options
      .map(function (opt, i) {
        return (
          '<button class="demo-quiz__opt" data-i="' + i + '">' +
          "<span>" + letters[i] + ") " + opt.text + "</span>" +
          '<span class="mark"></span>' +
          "</button>"
        );
      })
      .join("");

    var tag = data.tag || "Reading";

    root.innerHTML =
      '<div class="demo-quiz__top">' +
        '<span class="demo-quiz__tag">' + tag + "</span>" +
        '<span class="demo-quiz__badge">Sample question</span>' +
      "</div>" +
      '<div class="demo-quiz__inner">' +
        (data.passage ? '<div class="demo-quiz__passage">' + data.passage + "</div>" : "") +
        '<p class="demo-quiz__q">' + data.question + "</p>" +
        '<div class="demo-quiz__opts">' + optsHtml + "</div>" +
        '<div class="demo-quiz__feedback" id="demo-quiz-feedback"></div>' +
        '<button class="demo-quiz__cta" id="demo-quiz-cta" disabled>Check answer</button>' +
      "</div>";

    root.querySelectorAll(".demo-quiz__opt").forEach(function (btn) {
      btn.addEventListener("click", function () { onSelect(btn); });
    });
    document.getElementById("demo-quiz-cta").addEventListener("click", onCta);
  }

  function onSelect(btn) {
    if (checked) return;
    selected = parseInt(btn.getAttribute("data-i"), 10);
    root.querySelectorAll(".demo-quiz__opt").forEach(function (b) {
      b.classList.toggle("selected", b === btn);
    });
    var cta = document.getElementById("demo-quiz-cta");
    cta.disabled = false;
    cta.classList.add("ready");
  }

  function onCta() {
    if (!checked) {
      if (selected === null) return;
      reveal();
    } else {
      render();
    }
  }

  function reveal() {
    checked = true;
    var correctIdx = data.correct;

    root.querySelectorAll(".demo-quiz__opt").forEach(function (btn, i) {
      btn.disabled = true;
      btn.classList.remove("selected");
      var mark = btn.querySelector(".mark");
      if (i === correctIdx) {
        btn.classList.add("correct");
        mark.textContent = "✓";
      } else if (i === selected) {
        btn.classList.add("wrong");
        mark.textContent = "✗";
      } else {
        btn.classList.add("dimmed");
      }
    });

    var isCorrect = selected === correctIdx;
    var fb = document.getElementById("demo-quiz-feedback");
    fb.className = "demo-quiz__feedback show " + (isCorrect ? "correct" : "wrong");
    fb.innerHTML =
      "<strong>" + (isCorrect ? "✓ Correct" : "✗ Incorrect") + "</strong>" +
      (isCorrect ? data.explanationCorrect : data.explanationWrong);

    var cta = document.getElementById("demo-quiz-cta");
    cta.textContent = "Try again";
  }

  render();
})();
