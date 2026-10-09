(() => {
  const ui = window.FinesseUI;
  const forms = window.FinesseForms;
  if (!ui || !forms) return;

  const fields = [
    { name: "name", label: "姓名", autocomplete: "name", maxLength: 80 },
    {
      name: "company",
      label: "公司",
      autocomplete: "organization",
      help: "独立猎头可填写‘独立猎头’",
      maxLength: 160,
    },
    {
      name: "phone",
      label: "电话",
      type: "tel",
      inputmode: "tel",
      autocomplete: "tel",
      help: "可包含国家区号",
      maxLength: 40,
    },
    {
      name: "email",
      label: "邮箱",
      type: "email",
      inputmode: "email",
      autocomplete: "email",
      maxLength: 254,
    },
    {
      name: "role",
      label: "职位",
      options: [
        "独立猎头",
        "猎头顾问",
        "资深猎头顾问",
        "团队负责人",
        "合伙人 / 创始人",
        "企业招聘 / HR",
        "其他",
      ],
      other: true,
      maxLength: 80,
    },
    {
      name: "activePositions",
      label: "同时招聘的岗位数",
      options: ["0-5", "6-10", "11-20", "21-50", "51及以上"],
      maxLength: 16,
    },
    {
      name: "industry",
      label: "行业",
      help: "可多选",
      options: [
        "互联网与软件",
        "智能制造",
        "半导体与电子",
        "汽车与新能源",
        "医疗健康",
        "金融",
        "消费与零售",
        "物流与供应链",
        "其他",
      ],
      multiple: true,
      other: true,
      maxLength: 240,
      wide: true,
    },
  ];

  function apiUrl() {
    const value =
      document.querySelector('meta[name="trial-api"]')?.content ||
      "/api/trial-applications";
    const url = new URL(value, location.origin);
    if (
      url.pathname !== "/api/trial-applications" ||
      url.search ||
      url.hash ||
      url.username ||
      url.password ||
      (url.protocol !== "https:" &&
        !(
          url.protocol === "http:" &&
          ["127.0.0.1", "localhost"].includes(url.hostname)
        ))
    )
      throw new Error("Invalid trial API configuration");
    return url.href;
  }

  function render() {
    return `<section class="f-trial" id="apply" tabindex="-1" aria-labelledby="f-trial-title">
      <div class="f-container f-trial-layout">
        <div class="f-trial-intro">
          <h2 id="f-trial-title">申请 HunterBuddy 试用</h2>
          <p>产品正在开发中。留下你的信息，开放试用后我们会与你联系。</p>
          <p class="f-trial-thought">把时间，留给<br />真正重要的人。</p>
        </div>
        <div class="f-trial-content">
          <form class="f-trial-form" novalidate aria-label="HunterBuddy 试用申请" data-state="empty">
            <div class="f-form-grid">${fields.map((field) => (field.options ? forms.selectField : forms.field)(field)).join("")}</div>
            ${forms.consent("我已了解：以上信息将用于处理本次试用申请，并在开放试用后联系我。")}
            <button class="f-button f-trial-submit" type="submit"><span data-submit-label>提交试用申请</span>${ui.icon("chevronRight")}</button>
            <div class="f-form-status" role="status" aria-live="polite" aria-atomic="true" data-form-status></div>
          </form>
          <div class="f-form-success" tabindex="-1" data-form-success hidden>
            <h3>申请已收到</h3>
            <p>感谢你关注 HunterBuddy。开放试用后，我们会通过你留下的联系方式与你联系。</p>
            <p>提交申请不代表试用已开通。</p>
            ${ui.button("继续了解 HunterBuddy", "#work", true)}
          </div>
        </div>
      </div>
    </section>`;
  }

  function mount(section) {
    const form = section.querySelector("form");
    const controls = Object.fromEntries(
      fields.map(({ name }) => [name, form.elements.namedItem(name)]),
    );
    const consent = form.elements.namedItem("acknowledgedPurpose");
    const button = form.querySelector("[type=submit]");
    const label = form.querySelector("[data-submit-label]");
    const status = form.querySelector("[data-form-status]");
    const success = section.querySelector("[data-form-success]");
    const selects = Object.fromEntries(
      fields
        .filter((field) => field.options)
        .map((field) => [
          field.name,
          forms.mountSelect(controls[field.name], field),
        ]),
    );
    let busy = false;
    let unresolved = false;
    let submitted = false;
    let snapshot = null;

    function errorFor(field) {
      const value = controls[field.name].value.trim();
      if (field.options && !selects[field.name].valid())
        return `请选择${field.label}${field.other ? "，选择其他时请补充内容" : ""}`;
      if (!value) return `请填写${field.label}`;
      if (value.length > field.maxLength)
        return `${field.label}内容过长，请精简后再提交`;
      if (field.name === "email") {
        const [local, domain = ""] = value.split("@");
        const parts = domain.split(".");
        if (
          controls.email.validity.typeMismatch ||
          local.length > 64 ||
          local.startsWith(".") ||
          local.endsWith(".") ||
          local.includes("..") ||
          parts.length < 2 ||
          parts.some(
            (part) => !/^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(part),
          )
        )
          return "请填写有效的邮箱地址，例如 name@company.com";
      }
      if (field.name === "phone") {
        if (!window.libphonenumber)
          return "电话校验暂时无法加载，请刷新页面后重试";
        // Require the entire value and balanced, non-nested groups, not a number extracted from prose.
        const syntax =
          /^\+?[\d ().-]+$/.test(value) &&
          !/[^\d]$/.test(value.replace(/[)\s]+$/, ""));
        const groups = value.replace(/\(\d[\d\s-]*\)/g, "");
        let valid = false;
        try {
          valid =
            syntax &&
            !/[()]/.test(groups) &&
            Boolean(
              window.libphonenumber
                .parsePhoneNumber(value, {
                  defaultCountry: "CN",
                  extract: false,
                })
                ?.isValid(),
            );
        } catch {
          /* Invalid input is reported at the field. */
        }
        if (!valid) return "请填写有效的联系电话；境外号码请包含国家区号";
      }
      return "";
    }

    function validate() {
      let first = null;
      fields.forEach((field) => {
        const message = errorFor(field);
        forms.setError(controls[field.name], message);
        if (message && !first) first = field.name;
      });
      const consentError = consent.checked ? "" : "请先确认信息用途";
      forms.setError(consent, consentError);
      first ||= consentError ? "acknowledgedPurpose" : null;
      if (first) {
        status.textContent = "请检查上方标出的信息，再提交申请。";
        status.dataset.tone = "error";
        form.dataset.state = "invalid";
        if (selects[first]) selects[first].focus();
        else (controls[first] || consent).focus();
      }
      return !first;
    }

    function lock(value) {
      Object.entries(controls).forEach(([name, control]) => {
        if (selects[name]) selects[name].setDisabled(value);
        else control.readOnly = value;
      });
      consent.disabled = value;
    }

    function message(text, tone = "error") {
      status.textContent = text;
      status.dataset.tone = tone;
    }

    fields.forEach((field) => {
      const control = controls[field.name];
      const visible = forms.visibleControl(control);
      visible.closest(".f-form-field").addEventListener("focusout", (event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        if (control.value || visible.hasAttribute("aria-invalid"))
          forms.setError(control, errorFor(field));
      });
      control.addEventListener("input", () => {
        if (visible.getAttribute("aria-invalid") === "true")
          forms.setError(control, errorFor(field));
        if (!busy && !unresolved) {
          form.dataset.state = "editing";
          status.textContent = "";
          snapshot = null;
          label.textContent = "提交试用申请";
        }
      });
    });
    consent.addEventListener("change", () => {
      forms.setError(consent, consent.checked ? "" : "请先确认信息用途");
      if (!busy && !unresolved) {
        snapshot = null;
        status.textContent = "";
        label.textContent = "提交试用申请";
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (busy || submitted) return;
      if (!unresolved && !validate()) return;
      let endpoint;
      try {
        endpoint = apiUrl();
      } catch {
        message("申请服务暂时不可用，请稍后重试。");
        return;
      }
      if (!snapshot) {
        if (!window.crypto?.randomUUID) {
          message("当前浏览器无法提交申请，请使用更新的浏览器后重试。");
          return;
        }
        snapshot = Object.fromEntries(
          fields.map(({ name }) => [name, controls[name].value.trim()]),
        );
        snapshot.acknowledgedPurpose = true;
        snapshot.submissionId = crypto.randomUUID();
      }
      busy = true;
      lock(true);
      button.disabled = true;
      form.setAttribute("aria-busy", "true");
      form.dataset.state = "submitting";
      label.textContent = "提交中";
      message("正在提交，请稍候。", "neutral");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          credentials: "omit",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
          signal: controller.signal,
        });
        const result = await response.json();
        if (
          response.ok &&
          result.status === "received" &&
          result.receipt === snapshot.submissionId
        ) {
          submitted = true;
          unresolved = false;
          form.dataset.state = "received";
          form.hidden = true;
          form.reset();
          Object.values(selects).forEach((select) => select.reset());
          snapshot = null;
          success.hidden = false;
          success.focus({ preventScroll: true });
          window.scrollTo({
            top:
              success.getBoundingClientRect().top +
              window.scrollY -
              (document.querySelector(".f-header")?.offsetHeight || 0) -
              24,
            behavior: "instant",
          });
        } else if (
          !response.ok &&
          { 400: "invalid", 429: "rate_limited", 503: "unavailable" }[
            response.status
          ] === result.status
        ) {
          unresolved = false;
          lock(false);
          form.dataset.state = result.status;
          if (result.status === "invalid") {
            snapshot = null;
            message("申请信息未通过校验，请检查并修改后重新提交。");
            const rejected = fields.filter((field) =>
              Object.hasOwn(result.errors || {}, field.name),
            );
            rejected.forEach((field) =>
              forms.setError(
                controls[field.name],
                `请检查${field.label}后重新提交`,
              ),
            );
            if (rejected.length) {
              const first = rejected[0].name;
              if (selects[first]) selects[first].focus();
              else controls[first].focus();
            }
          } else
            message(
              result.status === "rate_limited"
                ? "提交过于频繁，请稍后再试。已填写的信息会保留在当前页面。"
                : "申请暂未提交，请稍后重试。已填写的信息会保留在当前页面。",
            );
        } else {
          throw new Error("Unconfirmed application response");
        }
      } catch {
        unresolved = true;
        form.dataset.state = "unconfirmed";
        message(
          "暂未确认申请结果。请重试确认这次申请；为避免重复，重试会使用相同资料。",
        );
      } finally {
        clearTimeout(timer);
        busy = false;
        button.disabled = submitted;
        form.removeAttribute("aria-busy");
        label.textContent =
          form.dataset.state === "invalid" ? "提交试用申请" : "重试提交";
      }
    });
  }

  window.FinesseTrial = { render, mount };
})();
