import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { heroSteps, mechanismStages } from "./landing-data";
import {
  DemoDialog,
  HeroEvidenceRail,
  LandingNav,
  ScenarioRail,
  WorkflowProof,
  scrollToLandingSection,
} from "./landing-components";
import "./landing.css";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useCompactHero() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
}

function useScrollReveal(reducedMotion) {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll(".lp-reveal"));
    document.body.classList.add("lp-reveal-ready");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return () => document.body.classList.remove("lp-reveal-ready");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.08 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      document.body.classList.remove("lp-reveal-ready");
    };
  }, [reducedMotion]);
}

function MechanismWorkspace() {
  const [active, setActive] = useState(mechanismStages[0].id);
  const current =
    mechanismStages.find((stage) => stage.id === active) || mechanismStages[0];

  return (
    <div className="lp-mechanism-workspace">
      <div
        className="lp-mechanism-list"
        role="tablist"
        aria-label="Hunter 推进机制"
      >
        {mechanismStages.map((stage) => (
          <button
            type="button"
            role="tab"
            aria-selected={stage.id === active}
            className={stage.id === active ? "is-active" : ""}
            key={stage.id}
            onClick={() => setActive(stage.id)}
          >
            <span>{stage.index}</span>
            <strong>{stage.label}</strong>
            <Icon name="chevronRight" />
          </button>
        ))}
      </div>

      <article className="lp-mechanism-detail">
        <div className="lp-mechanism-scan" aria-hidden="true" />
        <div className="lp-mechanism-heading">
          <span>{current.proof}</span>
          <Icon name={current.human ? "user" : "activity"} />
        </div>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        <ul>
          {current.facts.map((fact) => (
            <li key={fact}>
              <span />
              {fact}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export function LandingPage() {
  const reducedMotion = useReducedMotion();
  const compactHero = useCompactHero();
  const [activeHeroStage, setActiveHeroStage] = useState(2);
  const [demoOpen, setDemoOpen] = useState(false);

  useScrollReveal(reducedMotion);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Hunter｜围绕岗位，把该找的人找出来";
    document.documentElement.classList.add("lp-document");
    document.body.classList.add("lp-body");
    return () => {
      document.title = previousTitle;
      document.documentElement.classList.remove("lp-document");
      document.body.classList.remove("lp-body");
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveHeroStage((current) => (current + 1) % (compactHero ? 4 : 5));
    }, 2800);
    return () => window.clearInterval(timer);
  }, [compactHero, reducedMotion]);

  useEffect(() => {
    if (compactHero && activeHeroStage > 3) setActiveHeroStage(0);
  }, [activeHeroStage, compactHero]);

  return (
    <div className="lp-page">
      <LandingNav onDemoOpen={() => setDemoOpen(true)} />

      <main>
        <section className="lp-hero" aria-labelledby="lp-hero-title">
          <div className="lp-hero-main">
            <div className="lp-hero-copy">
              <p className="lp-hero-thesis">
                <span />
                难岗位真正卡人的，是找不全，也说不清为什么是他。
              </p>
              <h1 id="lp-hero-title">
                <span className="lp-title-line">给我一个难岗位，</span>
                <span className="lp-title-line">把该找的人找出来。</span>
              </h1>
              <p className="lp-hero-description">
                Hunter
                先吃透岗位，再从已有候选人、人才版图、公开网络、论文、专利和开源项目并行找人；
                <br className="lp-desktop-break" />
                统一身份、查重、补证和匹配，把有依据的候选池交给你判断。
              </p>
              <div className="lp-hero-actions">
                <button
                  type="button"
                  className="lp-button lp-button-primary"
                  onClick={() => setDemoOpen(true)}
                >
                  拿一个岗位来演示
                  <Icon name="chevronRight" />
                </button>
                <Link
                  className="lp-button lp-button-text"
                  to="/tasks/position-vla"
                >
                  看 VLA 岗位怎么找人
                  <Icon name="chevronRight" />
                </Link>
              </div>
              <div className="lp-hero-availability">
                <span>
                  <Icon name="shield" /> 覆盖过哪些渠道，一眼可查
                </span>
                <span>
                  <Icon name="route" /> 联系、推荐和口径由你决定
                </span>
              </div>
            </div>

            <HeroEvidenceRail
              activeStage={activeHeroStage}
              onStageChange={setActiveHeroStage}
            />
          </div>

          <div className="lp-hero-steps">
            {heroSteps.map((step) => (
              <article key={step.index}>
                <Icon name={step.icon} />
                <div>
                  <header>
                    <span>{step.index}</span>
                    <h2>{step.title}</h2>
                  </header>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-mechanism lp-reveal" id="mechanism">
          <div className="lp-section-inner">
            <div className="lp-section-heading lp-section-heading-light">
              <h2>
                <span className="lp-title-line">找人，不是搜关键词。</span>
                <span className="lp-title-line">要把所有渠道，</span>
                <span className="lp-title-line">跑成一个候选池。</span>
              </h2>
              <p>
                一个难岗位的人，往往散在已有数据库、目标公司、公开网络、论文、专利、开源项目和认证平台里。Hunter
                把它们召回、合并、去重、补证，再交到你手里。
              </p>
            </div>
            <MechanismWorkspace />
          </div>
        </section>

        <section className="lp-workflow lp-reveal" id="workflow">
          <div className="lp-section-inner">
            <div className="lp-section-heading lp-section-heading-split">
              <h2>
                <span className="lp-title-line">不讲一堆 AI 功能。</span>
                <span className="lp-title-line">看它怎样</span>
                <span className="lp-title-line">为一个岗位找人。</span>
              </h2>
              <div>
                <p>
                  用“具身智能 VLA
                  算法负责人”演示：先定义什么人算合适，再跨渠道召回、核验身份、去重补证，最后把候选池交给猎头筛选。所有内容均为演示数据。
                </p>
                <Link to="/tasks/position-vla">
                  看完整寻访线 <Icon name="external" />
                </Link>
              </div>
            </div>
            <WorkflowProof />
          </div>
        </section>

        <section className="lp-control lp-reveal" id="control">
          <div className="lp-section-inner">
            <div className="lp-control-intro">
              <h2>
                <span className="lp-title-line">搜索、查重、匹配，</span>
                <span className="lp-title-line">交给系统；</span>
                <span className="lp-title-line">联系和推荐，你定。</span>
              </h2>
              <p>
                系统可以判断两份资料是不是同一个人，也可以把符合与不符合岗位的依据摆出来；但候选人温度、客户关系、联系时机和正式推荐，必须由懂这盘业务的你决定。
              </p>
            </div>
            <div className="lp-control-stage">
              <div className="lp-control-system">
                <span>HUNTER 来做</span>
                <h3>把候选池整理到可以判断</h3>
                <ul>
                  <li>
                    <Icon name="search" /> 按岗位跨渠道召回人选
                  </li>
                  <li>
                    <Icon name="database" /> 统一身份、去重与补全
                  </li>
                  <li>
                    <Icon name="signal" /> 标出匹配理由、风险和缺口
                  </li>
                </ul>
              </div>
              <div className="lp-control-gate">
                <span className="lp-gate-orbit" aria-hidden="true" />
                <div className="lp-gate-core">
                  <Icon name="lock" />
                  <strong>人工判断</strong>
                  <small>系统在这里刹停</small>
                </div>
              </div>
              <div className="lp-control-human">
                <span>你来决定</span>
                <h3>谁值得联系，谁可以推荐</h3>
                <ul>
                  <li>
                    <Icon name="user" /> 识别关系与候选人温度
                  </li>
                  <li>
                    <Icon name="message" /> 决定联系顺序与沟通口径
                  </li>
                  <li>
                    <Icon name="check" /> 确认储备、推荐、补证或暂停
                  </li>
                </ul>
              </div>
            </div>
            <div className="lp-control-note">
              <Icon name="shield" />
              <p>
                <strong>演示不会替你联系任何人。</strong>{" "}
                页面不会发送消息、邮件或写入外部系统；正式产品也会把联系、正式推荐和承诺类动作留给你确认。
              </p>
            </div>
          </div>
        </section>

        <section className="lp-scenarios lp-reveal" id="scenarios">
          <div className="lp-section-inner lp-scenarios-layout">
            <div className="lp-scenarios-copy">
              <h2>
                <span className="lp-title-line">难岗位的人，</span>
                <span className="lp-title-line">往往不在同一个地方。</span>
              </h2>
              <p>
                先从你已经认识的人里找，再沿目标公司和团队往下摸；公开履历、论文、专利、开源项目和用户上传的简历，最后都回到同一个候选池里。
              </p>
            </div>
            <ScenarioRail />
          </div>
        </section>

        <section className="lp-final-cta lp-reveal">
          <div className="lp-final-track" aria-hidden="true">
            <span />
          </div>
          <div className="lp-final-content">
            <h2>
              <span className="lp-title-line">带个难岗位来，</span>
              <span className="lp-title-line">
                <span className="lp-title-mobile-chunk">看看 Hunter</span>{" "}
                <span className="lp-title-mobile-chunk">能找到谁。</span>
              </span>
            </h2>
            <p>
              带上岗位要求、你已经知道的线索，以及目前找过的渠道。我们用真实约束演示怎样召回、核验、去重和匹配，不讲空泛功能。
            </p>
            <div>
              <button
                type="button"
                className="lp-button lp-button-primary lp-button-large"
                onClick={() => setDemoOpen(true)}
              >
                拿一个岗位来演示 <Icon name="chevronRight" />
              </button>
              <Link
                className="lp-button lp-button-inverse-text"
                to="/tasks/position-vla"
              >
                先看 VLA 岗位怎么找人 <Icon name="external" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <strong>HUNTER</strong>
          <p>为独立猎头准备的找人工作系统。</p>
        </div>
        <nav aria-label="页脚导航">
          {[
            ["怎么找人", "mechanism"],
            ["真实寻访", "workflow"],
            ["找人渠道", "scenarios"],
            ["人机边界", "control"],
          ].map(([label, id]) => (
            <button
              type="button"
              key={id}
              onClick={() => scrollToLandingSection(id)}
            >
              {label}
            </button>
          ))}
          <Link to="/login">登录</Link>
        </nav>
        <p className="lp-footer-meta">© 2026 Hunter · 原型演示页面</p>
      </footer>

      <DemoDialog open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
