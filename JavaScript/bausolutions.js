(function () {
  emailjs.init("Ib3LPJQWavUBFpeXR");

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const docEl = document.documentElement;
  const storedTheme = localStorage.getItem("bau-theme");
  const themeToggle = qs("#themeToggle");

  let recaptchaResponse = "";

  window.recaptchaCompleted = function (token) {
    recaptchaResponse = token || "";

    const formMessage = qs("#formMessage");
    if (formMessage && recaptchaResponse) {
      formMessage.textContent = "";
      formMessage.style.color = "";
    }
  };

  function resetRecaptcha() {
    recaptchaResponse = "";

    if (window.grecaptcha && typeof window.grecaptcha.reset === "function") {
      window.grecaptcha.reset();
    }
  }

  function applyTheme(theme) {
    docEl.setAttribute("data-theme", theme);

    if (!themeToggle) return;

    const icon = qs("i", themeToggle);
    const label = qs("span", themeToggle);

    if (theme === "light") {
      if (icon) icon.className = "fa-solid fa-sun";
      if (label) label.textContent = "Light";
    } else {
      if (icon) icon.className = "fa-solid fa-moon";
      if (label) label.textContent = "Dark";
    }
  }

  applyTheme(storedTheme || "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme =
        docEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem("bau-theme", nextTheme);
      applyTheme(nextTheme);
    });
  }

  const menuToggle = qs("#menuToggle");
  const siteNav = qs("#siteNav");
  const navLinks = qsa(".site-nav a");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const tabButtons = qsa(".tab-btn");
  const tabPanels = qsa(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.tab;

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanels.forEach((panel) => panel.classList.remove("active"));

      button.classList.add("active");
      qs(`#${targetId}`)?.classList.add("active");
    });
  });

  const revealItems = qsa(".reveal");

  if ("IntersectionObserver" in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  const yearNode = qs("#currentYear");
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  /* =========================
     HERO WORKFLOW ROTATION
  ========================= */

  const workflowSlides = qsa(".workflow-slide");
  const workflowTabs = qsa(".workflow-tab");
  const workflowTitle = qs("#workflowTitle");
  const workflowProgressBar = qs("#workflowProgressBar");

  const workflowTitles = [
    "Purchase Request Approval",
    "Leave Request Workflow",
    "Service Update Routing",
  ];

  const workflowDuration = 5500;
  let workflowIndex = 0;
  let workflowTimer = null;

  function restartWorkflowProgress() {
    if (!workflowProgressBar) return;
    workflowProgressBar.style.animation = "none";
    void workflowProgressBar.offsetWidth;
    workflowProgressBar.style.animation = `workflowFill ${workflowDuration}ms linear infinite`;
  }

  function setWorkflow(index) {
    workflowSlides.forEach((slide) => slide.classList.remove("active"));
    workflowTabs.forEach((tab) => tab.classList.remove("active"));

    workflowSlides[index]?.classList.add("active");
    workflowTabs[index]?.classList.add("active");

    if (workflowTitle) {
      workflowTitle.textContent = workflowTitles[index] || "";
    }

    workflowIndex = index;
    restartWorkflowProgress();
  }

  function startWorkflowRotation() {
    if (workflowSlides.length < 2) return;

    workflowTimer = window.setInterval(() => {
      const next = (workflowIndex + 1) % workflowSlides.length;
      setWorkflow(next);
    }, workflowDuration);
  }

  function resetWorkflowRotation() {
    if (workflowTimer) window.clearInterval(workflowTimer);
    startWorkflowRotation();
  }

  workflowTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      setWorkflow(index);
      resetWorkflowRotation();
    });
  });

  if (workflowSlides.length) {
    setWorkflow(0);
    startWorkflowRotation();
  }

  /* =========================
     INTERACTIVE DEMO MODAL
  ========================= */

  const demoModal = qs("#demoModal");
  const demoModalOverlay = qs("#demoModalOverlay");
  const demoModalClose = qs("#demoModalClose");
  const demoModalTitle = qs("#demoModalTitle");
  const demoModalText = qs("#demoModalText");
  const demoFormFields = qs("#demoFormFields");
  const demoRunBtn = qs("#demoRunBtn");
  const demoResetBtn = qs("#demoResetBtn");
  const demoDecisionBox = qs("#demoDecisionBox");
  const demoDecisionText = qs("#demoDecisionText");
  const demoDecisionActions = qs("#demoDecisionActions");
  const demoCurrentStatus = qs("#demoCurrentStatus");
  const demoCurrentOwner = qs("#demoCurrentOwner");
  const demoBusinessOutcome = qs("#demoBusinessOutcome");
  const demoSteps = qs("#demoSteps");
  const demoLog = qs("#demoLog");
  const demoTriggers = qsa(".demo-card-trigger");

  const demoConfigs = {
    purchase: {
      title: "Purchase Request Demo",
      intro: "Create a sample request and see how routing changes based on amount and urgency.",
      outcome: "Clear approvals, less chasing, better visibility",
      fields: [
        {
          id: "purchaseAmount",
          label: "Request amount",
          type: "select",
          options: [
            { value: "small", label: "Below ZMW 5,000" },
            { value: "medium", label: "ZMW 5,000 to ZMW 20,000" },
            { value: "large", label: "Above ZMW 20,000" },
          ],
        },
        {
          id: "purchaseUrgency",
          label: "Urgency",
          type: "select",
          options: [
            { value: "normal", label: "Normal" },
            { value: "urgent", label: "Urgent" },
          ],
        },
      ],
      buildInitialSteps(values) {
        const needsFinance = values.purchaseAmount !== "small";

        return [
          {
            title: "Request Submitted",
            description: "The requester submits a structured purchase request.",
            owner: "Requester",
            status: "Submitted",
          },
          {
            title: "Manager Review",
            description: "The line manager reviews business need and completeness.",
            owner: "Line Manager",
            status: "Manager Review",
          },
          ...(needsFinance
            ? [
                {
                  title: "Finance Check",
                  description: "Finance checks budget, policy, and approval threshold.",
                  owner: "Finance",
                  status: "Finance Review",
                },
              ]
            : []),
          {
            title: "Final Outcome",
            description:
              "The request is marked approved or declined and everyone can see the result.",
            owner: "System",
            status: "Outcome Pending",
          },
        ];
      },
      nextDecision(values) {
        if (values.purchaseAmount === "large") {
          return {
            text: "Manager reviewed the request. What happens next?",
            buttons: [
              { label: "Approve and send to Finance", action: "finance" },
              { label: "Reject request", action: "reject" },
            ],
          };
        }

        if (values.purchaseAmount === "medium") {
          return {
            text: "Manager reviewed the request. Choose the next action.",
            buttons: [
              { label: "Approve", action: "finance" },
              { label: "Send back for changes", action: "changes" },
              { label: "Reject", action: "reject" },
            ],
          };
        }

        return {
          text: "Manager reviewed the request. Choose the next action.",
          buttons: [
            { label: "Approve", action: "approve" },
            { label: "Send back for changes", action: "changes" },
            { label: "Reject", action: "reject" },
          ],
        };
      },
    },

    service: {
      title: "Service Update Demo",
      intro: "Log a service update and decide whether the issue needs follow-up routing.",
      outcome: "Faster follow-ups and cleaner coordination",
      fields: [
        {
          id: "serviceIssue",
          label: "Was an issue detected?",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "servicePriority",
          label: "Priority",
          type: "select",
          options: [
            { value: "high", label: "High" },
            { value: "normal", label: "Normal" },
            { value: "low", label: "Low" },
          ],
        },
      ],
      buildInitialSteps(values) {
        return [
          {
            title: "Service Update Logged",
            description: "A technician captures the service update once at source.",
            owner: "Technician",
            status: "Logged",
          },
          ...(values.serviceIssue === "yes"
            ? [
                {
                  title: "Issue Flagged",
                  description:
                    "The workflow flags the issue and prepares a follow-up task.",
                  owner: "Operations",
                  status: "Issue Raised",
                },
                {
                  title: "Task Assigned",
                  description: "The next action is routed to the right support team.",
                  owner: "Support Team",
                  status: "Assigned",
                },
              ]
            : []),
          {
            title: "Status Updated",
            description: "The job outcome is visible to operations and management.",
            owner: "System",
            status: "Outcome Pending",
          },
        ];
      },
      nextDecision(values) {
        if (values.serviceIssue === "yes") {
          return {
            text: "The system detected a service issue. What should happen?",
            buttons: [
              { label: "Assign follow-up task", action: "assign" },
              { label: "Close as resolved", action: "approve" },
            ],
          };
        }

        return {
          text: "No issue was detected. What should happen?",
          buttons: [
            { label: "Close update", action: "approve" },
            { label: "Flag for manual review", action: "changes" },
          ],
        };
      },
    },

    leave: {
      title: "Leave Request Demo",
      intro: "Raise a leave request and see how the workflow responds to duration and team coverage.",
      outcome: "Fewer delays between employee, manager, and HR",
      fields: [
        {
          id: "leaveDays",
          label: "Leave duration",
          type: "select",
          options: [
            { value: "short", label: "1 to 3 days" },
            { value: "medium", label: "4 to 10 days" },
            { value: "long", label: "More than 10 days" },
          ],
        },
        {
          id: "leaveCoverage",
          label: "Team coverage available?",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
      ],
      buildInitialSteps(values) {
        return [
          {
            title: "Leave Request Submitted",
            description: "The employee submits leave dates using one standard form.",
            owner: "Employee",
            status: "Submitted",
          },
          {
            title: "Manager Review",
            description:
              "The line manager checks timing, leave balance, and team coverage.",
            owner: "Line Manager",
            status: "Approval Review",
          },
          ...(values.leaveCoverage === "yes"
            ? [
                {
                  title: "HR Record Updated",
                  description:
                    "Approved leave is recorded cleanly without duplicate admin work.",
                  owner: "HR",
                  status: "HR Update",
                },
              ]
            : []),
          {
            title: "Final Outcome",
            description:
              "The employee receives a clear outcome and the audit trail is retained.",
            owner: "System",
            status: "Outcome Pending",
          },
        ];
      },
      nextDecision(values) {
        if (values.leaveCoverage === "no" || values.leaveDays === "long") {
          return {
            text: "This request needs closer review. What should happen next?",
            buttons: [
              { label: "Escalate for review", action: "finance" },
              { label: "Reject request", action: "reject" },
            ],
          };
        }

        return {
          text: "Manager reviewed the leave request. Choose the next action.",
          buttons: [
            { label: "Approve leave", action: "approve" },
            { label: "Send back for changes", action: "changes" },
            { label: "Reject", action: "reject" },
          ],
        };
      },
    },
  };

  let activeDemoType = "purchase";
  let activeDemoValues = {};
  let activeSteps = [];
  let demoHasRun = false;

  function setDemoSummary(status, owner, outcome) {
    if (demoCurrentStatus) demoCurrentStatus.textContent = status;
    if (demoCurrentOwner) demoCurrentOwner.textContent = owner;
    if (demoBusinessOutcome) demoBusinessOutcome.textContent = outcome;
  }

  function addDemoLog(message) {
    if (!demoLog) return;
    const item = document.createElement("div");
    item.className = "demo-log-item";
    item.textContent = message;
    demoLog.prepend(item);
  }

  function renderDemoFields(type) {
    const config = demoConfigs[type];
    if (!config || !demoFormFields) return;

    demoFormFields.innerHTML = config.fields
      .map((field) => {
        if (field.type === "select") {
          return `
            <div class="form-row">
              <label for="${field.id}">${field.label}</label>
              <select id="${field.id}" name="${field.id}">
                ${field.options
                  .map(
                    (option) =>
                      `<option value="${option.value}">${option.label}</option>`
                  )
                  .join("")}
              </select>
            </div>
          `;
        }

        return "";
      })
      .join("");
  }

  function getDemoValues(type) {
    const config = demoConfigs[type];
    const values = {};

    config.fields.forEach((field) => {
      const input = qs(`#${field.id}`);
      values[field.id] = input ? input.value : "";
    });

    return values;
  }

  function renderSteps(steps) {
    if (!demoSteps) return;

    demoSteps.innerHTML = steps
      .map(
        (step, index) => `
          <div class="demo-step" data-step-index="${index}">
            <span class="demo-step-no">${String(index + 1).padStart(2, "0")}</span>
            <div class="demo-step-main">
              <strong>${step.title}</strong>
              <p>${step.description}</p>
            </div>
            <span class="demo-step-status">${step.stateLabel || "Pending"}</span>
          </div>
        `
      )
      .join("");
  }

  function updateStepState(index, state, label) {
    const step = activeSteps[index];
    const stepNode = qs(`.demo-step[data-step-index="${index}"]`, demoSteps);

    if (!step || !stepNode) return;

    step.state = state;
    step.stateLabel = label;

    stepNode.classList.remove("pending", "active", "done");
    stepNode.classList.add(state);

    const statusNode = qs(".demo-step-status", stepNode);
    if (statusNode) statusNode.textContent = label;
  }

  function resetStepStates() {
    activeSteps = activeSteps.map((step, index) => ({
      ...step,
      state: "pending",
      stateLabel: index === 0 ? "Ready" : "Pending",
    }));

    renderSteps(activeSteps);

    activeSteps.forEach((step, index) => {
      updateStepState(index, step.state, step.stateLabel);
    });
  }

  function showDecision(text, buttons) {
    if (!demoDecisionBox || !demoDecisionText || !demoDecisionActions) return;

    demoDecisionBox.hidden = false;
    demoDecisionText.textContent = text;
    demoDecisionActions.innerHTML = "";

    buttons.forEach((button) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-secondary";
      btn.textContent = button.label;
      btn.dataset.action = button.action;
      demoDecisionActions.appendChild(btn);
    });
  }

  function hideDecision() {
    if (!demoDecisionBox || !demoDecisionActions) return;
    demoDecisionBox.hidden = true;
    demoDecisionActions.innerHTML = "";
  }

  function openDemoModal(type) {
    const config = demoConfigs[type];
    if (!config || !demoModal) return;

    activeDemoType = type;
    demoHasRun = false;
    activeDemoValues = {};
    activeSteps = [];

    if (demoModalTitle) demoModalTitle.textContent = config.title;
    if (demoModalText) demoModalText.textContent = config.intro;

    renderDemoFields(type);
    hideDecision();

    if (demoLog) {
      demoLog.innerHTML =
        '<div class="demo-log-item">Demo ready. Set your sample request and click Run Demo.</div>';
    }

    setDemoSummary("Ready", "-", config.outcome);

    if (demoSteps) {
      demoSteps.innerHTML = "";
    }

    demoModal.classList.add("open");
    demoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeDemoModal() {
    if (!demoModal) return;
    demoModal.classList.remove("open");
    demoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function runDemo() {
    const config = demoConfigs[activeDemoType];
    if (!config) return;

    activeDemoValues = getDemoValues(activeDemoType);
    activeSteps = config.buildInitialSteps(activeDemoValues);

    resetStepStates();
    demoHasRun = true;

    updateStepState(0, "done", activeSteps[0].status);
    setDemoSummary(activeSteps[0].status, activeSteps[0].owner, config.outcome);
    addDemoLog(activeSteps[0].description);

    if (activeSteps[1]) {
      updateStepState(1, "active", activeSteps[1].status);
      setDemoSummary(activeSteps[1].status, activeSteps[1].owner, config.outcome);
      addDemoLog(activeSteps[1].description);
    }

    const decision = config.nextDecision(activeDemoValues);
    showDecision(decision.text, decision.buttons);
  }

  function finishDemo(resultType) {
    if (!demoHasRun || !activeSteps.length) return;

    const finalIndex = activeSteps.length - 1;

    for (let i = 0; i < finalIndex; i += 1) {
      if (activeSteps[i].state !== "done") {
        updateStepState(i, "done", activeSteps[i].status);
      }
    }

    if (resultType === "finance" || resultType === "assign") {
      if (activeSteps.length > 2) {
        for (let i = 1; i < finalIndex; i += 1) {
          updateStepState(i, "done", activeSteps[i].status);
        }
      }

      updateStepState(finalIndex, "done", "Completed");
      setDemoSummary(
        resultType === "assign" ? "Task Assigned" : "Approved",
        resultType === "assign" ? "Support Team" : "System",
        resultType === "assign"
          ? "Follow-up task created automatically"
          : "Request approved with full visibility"
      );
      addDemoLog(
        resultType === "assign"
          ? "Follow-up work was assigned automatically."
          : "The workflow completed successfully."
      );
    }

    if (resultType === "approve") {
      updateStepState(finalIndex, "done", "Approved");
      setDemoSummary("Approved", "System", "Process completed successfully");
      addDemoLog("The request was approved and the final status was updated.");
    }

    if (resultType === "changes") {
      updateStepState(finalIndex, "done", "Changes Requested");
      setDemoSummary(
        "Changes Requested",
        "Requester",
        "Returned for correction with full audit trail"
      );
      addDemoLog("The request was sent back for changes.");
    }

    if (resultType === "reject") {
      updateStepState(finalIndex, "done", "Rejected");
      setDemoSummary("Rejected", "System", "Decision captured with clear audit history");
      addDemoLog("The request was rejected and the decision was recorded.");
    }

    hideDecision();
  }

  demoTriggers.forEach((card) => {
    const type = card.dataset.demo || "purchase";

    card.addEventListener("click", () => {
      openDemoModal(type);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDemoModal(type);
      }
    });
  });

  if (demoRunBtn) {
    demoRunBtn.addEventListener("click", runDemo);
  }

  if (demoResetBtn) {
    demoResetBtn.addEventListener("click", () => {
      openDemoModal(activeDemoType);
    });
  }

  if (demoDecisionActions) {
    demoDecisionActions.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const action = button.dataset.action;
      finishDemo(action);
    });
  }

  if (demoModalClose) {
    demoModalClose.addEventListener("click", closeDemoModal);
  }

  if (demoModalOverlay) {
    demoModalOverlay.addEventListener("click", closeDemoModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && demoModal?.classList.contains("open")) {
      closeDemoModal();
    }
  });

  /* =========================
     CONTACT FORM
  ========================= */

  const contactForm = qs("#contactForm");
  const formMessage = qs("#formMessage");
  const submitButton =
    qs('#contactForm button[type="submit"].btn-primary') ||
    qs("#contactForm button[type='submit']");

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = qs("#name")?.value.trim() || "";
      const email = qs("#email")?.value.trim() || "";
      const subject = qs("#subject")?.value.trim() || "";
      const company = qs("#company")?.value.trim() || "";
      const message = qs("#message")?.value.trim() || "";

      if (!recaptchaResponse) {
        if (formMessage) {
          formMessage.textContent = "Please complete the CAPTCHA before submitting.";
          formMessage.style.color = "#b87333";
        }
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      if (formMessage) {
        formMessage.textContent = "";
        formMessage.style.color = "";
      }

      try {
        await emailjs.send("bausolutions_msgservice", "bausolutions_msgtemplate", {
          name,
          email,
          subject,
          company,
          message,
          "g-recaptcha-response": recaptchaResponse,
        });

        if (formMessage) {
          formMessage.textContent = "Message sent successfully.";
          formMessage.style.color = "#7aa889";
        }

        contactForm.reset();
        resetRecaptcha();
      } catch (error) {
        if (formMessage) {
          formMessage.textContent =
            "We are having trouble submitting your message. Please email info@bausolutions.africa.";
          formMessage.style.color = "#b87333";
        }

        console.error("EmailJS error:", error);
        resetRecaptcha();
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Enquiry";
        }
      }
    });
  }

  /* =========================
     BACK TO TOP
  ========================= */

  const backToTopButton = qs("#backToTop");

  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
})();