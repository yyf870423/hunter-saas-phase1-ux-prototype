export default {
  slug: "job-matching",
  name: "Matching candidates to jobs",
  title: "Candidate job matching: JD to shortlist and the limits of AI | HunterBuddy",
  description:
    "How to match candidates to jobs: break down the job description, uncover the real need, rank a shortlist, and see what AI can and can’t do. A HunterBuddy guide.",
  kicker: "Headhunting in practice · Job matching",
  h1: ["How do you match candidates to jobs?", "From job requirements to a shortlist"],
  answer:
    "Job matching means lining up what a role really needs with what a person has really done. You break the job description (JD) into must-haves, core skills, industry background and nice-to-haves, ask the hiring manager about the needs nobody wrote down, then screen and rank on that basis, setting out why you recommend each candidate and what the risks are. Keywords alone will both miss good people and let the wrong ones through, and while AI can help you search and compare, the final judgment stays with the consultant.",
  teaser: "Breaking down the JD, probing the real need, ranking the list, and why keywords let you down.",
  keywords: [
    "candidate job matching",
    "AI job matching for recruiters",
    "job matching model",
    "AI recruiting tools",
    "AI recruiting",
    "how to match candidates to jobs",
  ],
  related: ["ai-assistant-for-headhunters", "finding-candidates", "same-name-candidates"],
  sections: [
    {
      h2: "First step in job matching: how do you break down the JD?",
      body: [
        "When a JD comes in, don’t start searching right away. Many JDs are written from a template or adapted from a similar earlier role, with every requirement laid out flat, so you can’t tell which ones matter and which were added in passing. Break it into four layers first, and every step after that goes much more smoothly.",
        {
          cards: [
            [
              "Must-haves",
              "Conditions without which you can’t put someone forward: having taken a certain kind of product into mass production, having led a team, the work location, the language. In this layer, the fewer the better, and the clearer the better.",
            ],
            [
              "Core skills",
              "What the role really calls on every day. Two openings for a head of computer vision can want different things: one needs real depth in the algorithms themselves, the other needs someone who can get them working on a production line. Those are two different kinds of people.",
            ],
            [
              "Industry background",
              "The kinds of companies and settings they’ve worked in. Smartphone imaging and industrial inspection are both vision work, but they face very different problems.",
            ],
            [
              "Nice-to-haves",
              "Good to have, fine to lack: published papers, open-source projects, experience leading cross-team work. Use them to separate candidates when you rank, not to screen people out.",
            ],
          ],
        },
        "Once it’s broken down, put the four layers on a single page and take it to the hiring manager to confirm. You’ll often find that a must-have in the JD is only a nice-to-have in their mind, while the condition they really screen on isn’t in the JD at all.",
      ],
    },
    {
      h2: "What should you ask the hiring manager beyond the JD?",
      body: [
        "This conversation decides how accurate the rest of your search will be. HR can explain the process, the budget and the timeline, but what problem this hire is meant to solve is often something only the hiring manager can tell you. Focus on questions like these:",
        {
          list: [
            "Why are you hiring now: a new team, a vacancy to fill, or a gap the current team can’t cover?",
            "Once this person joins, what’s the first thing they need to get done?",
            "Who is strongest on the team, and what’s missing? Should the new hire complement that person or take over from them?",
            "Of the people you’ve met so far, was there a near-miss, someone you almost hired? What was missing?",
            "Which companies are off-limits, and which ones would you especially like to see people from?",
          ],
        },
        "The fourth question is often the most useful. One concrete near-miss tells you more about what they want than a string of abstract requirements. Afterwards, re-sort the four layers and send them to the hiring manager to confirm, so if you disagree later, there’s a record to go back to.",
      ],
    },
    {
      h2: "Why does AI job matching often get it wrong?",
      body: [
        "Whether you search your own CV database or screen with a tool, the usual approach is to match words in the JD against words in the CV. It’s certainly fast, but it can’t get around three familiar problems:",
        {
          cards: [
            [
              "One thing, many names",
              "One person writes “visual perception”, another “machine vision”, a third just names the specific algorithm. Recognize only one wording and you miss the other two groups.",
            ],
            [
              "A title isn’t a level",
              "A “head of” at a small company may lead only two or three people, while a “senior engineer” at a big company may already run a team. Go by titles alone and it’s easy to overrate some people and underrate others.",
            ],
            [
              "Some needs never make the JD",
              "Whether someone can handle a startup’s pace, whether they’ve built something from zero to one, whether their style suits the hiring manager: these often decide the outcome, yet no keyword search will find them.",
            ],
          ],
        },
        "A job matching model, put simply, is a set of rules for comparing what the role needs with what the person has. Simple ones weight keywords. More sophisticated ones recognize different wordings for the same thing, follow the order of someone’s experience, and judge whether what a person has done is the same thing the role requires.",
        "A model can make the comparison faster and more thorough, but it only compares what’s written down. AI is good at reading everything scattered across different places, recognizing different wordings and matching up several records of the same person, so it can hand you a fuller first-pass list. What it can’t do well is the unwritten: how big a team someone really leads, why they want to leave, whether they’ll get on with this hiring manager. Those you find out by talking to them.",
      ],
    },
    {
      h2: "From longlist to shortlist: how do you screen and rank?",
      body: [
        "A longlist is about coverage, a shortlist about precision. The longlist is everyone who might fit. The shortlist is the people you’ll stake your own reputation on and put in front of the client. In between, the work roughly goes like this:",
        {
          steps: [
            [
              "Start with the must-haves",
              "Screen on the first layer only. Set aside anyone who doesn’t meet it, but don’t delete them. If the requirements change, you may need them again.",
            ],
            [
              "Then look at skills and background",
              "Check CVs, public information, papers and projects to see whether what they’ve done is the same thing the role needs.",
            ],
            [
              "Call to fill the gaps",
              "What paper won’t show you, such as team size, reporting line, what they’re working on now and whether they’re open to a move, you only learn by talking.",
            ],
            [
              "Rank by confidence",
              "Strong fit, clear motivation and a process that can move forward: those go first. Strong fit but unclear motivation gets a tier of its own.",
            ],
            [
              "Write the case and the risks",
              "One paragraph per person: why they fit, what that rests on, and what you’re still unsure of. Then send it to the client.",
            ],
          ],
        },
        "The most common ranking mistake is putting the strongest-looking person first. To a client, someone who broadly fits, genuinely wants the job and can start on time is often more useful than someone with a beautiful CV who probably won’t move.",
      ],
    },
    {
      h2: "How can HunterBuddy help with job matching?",
      body: [
        "HunterBuddy is the AI partner for headhunters. It’s still in development and currently offered as an invitation-only trial. Take the example from our homepage: Xingchuan Robotics has just raised a Series B, and the hiring manager, Qing Xu, sends over the JD for a Head of Computer Vision. Once you’ve talked it through with her, you hand the JD to HunterBuddy, and it helps like this:",
        {
          list: [
            "It starts with what you already have: the org charts you’ve built and your CV database, so the homework you’ve already done is put to use first.",
            "Then it fills the gaps from public information: papers, patents, open-source communities and code footprints (public code and repositories), noting where every lead came from.",
            "When the same person shows up in several sources, it checks their identity before merging the records. It won’t treat two records as one person just because the names match.",
            "Every candidate comes with the reasons for the match and the sources, and anything uncertain is listed separately for you to confirm.",
            "It works the other way, too: a newly uploaded CV can be matched against all your live searches.",
          ],
        },
        {
          demo: {
            context: "Xingchuan Robotics · Head of Computer Vision",
            title: "Candidates worth approaching",
            caption:
              "Illustrative: in the Xingchuan Robotics example, why each person fits and what still needs confirming sit right beside them.",
            items: [
              [
                "Industrial vision · Team lead",
                "Yue Lin",
                "Has led a production-line vision team. Three records merged. To confirm: team size and reporting line.",
              ],
              [
                "Robotics perception · Senior engineer",
                "Ning Zhou",
                "Relevant papers and project experience. To confirm: any mass-production experience.",
              ],
              [
                "Computer vision · Project lead",
                "Si Chen",
                "Has led cross-team projects. To confirm: current work and openness to a move.",
              ],
            ],
          },
        },
        {
          note: "What it gives you is sourced guidance, not a final verdict. Who to contact first, and whether to recommend them, is your decision.",
        },
      ],
    },
    {
      h2: "How do you write candidate recommendations clients want to read?",
      body: [
        "The most common problem with a candidate report is that it simply retells the CV in other words. The client doesn’t want a recap. They want your judgment: why this person suits this role, what you’re basing that on, and where you yourself aren’t sure.",
        {
          list: [
            "Tie the reasons to the requirements, and put what the hiring manager cares about most in the first sentence.",
            "Back every reason with its basis: did the candidate tell you, is it on the CV, or did you check it against public information?",
            "State the risks plainly: no mass-production experience, salary expectations on the high side, concerns about the commute.",
            "Keep facts and judgments apart. “Has led a complete algorithm team” is a fact. “Has management potential” is a judgment.",
          ],
        },
        "Putting the risks up front can look like undercutting yourself. In fact, you’re building credibility. When a client finds that the risks you flagged were all accurate, they’ll look more closely at the next person you put forward. Hide a problem, and sooner or later it will surface in an interview.",
      ],
    },
  ],
  faq: [
    [
      "What is a job matching model?",
      "It’s a set of rules for comparing what a role needs with what a person has. Simple ones score by keywords and weights. More sophisticated ones recognize different wordings for the same thing and follow the sequence of someone’s experience. However sophisticated, it only compares what’s written down. Things that aren’t, such as team size or why someone is looking, still need a consultant to ask.",
    ],
    [
      "Can AI recruiting tools match candidates to jobs automatically?",
      "They can do the first screen, but not the final judgment. AI is good at reading large numbers of CVs and public sources, recognizing different wordings and matching up several records of the same person, which gives you a fuller candidate list. Whether someone is open to a move, whether they’ll get on with the hiring manager, and whether their real ability matches the paper all take a consultant’s conversations and judgment.",
    ],
    [
      "Why do AI recruiting tools still recommend the wrong people?",
      "There are three common reasons. The same thing goes by different names, so recognizing only one wording misses people. Titles don’t line up with actual seniority. And some of the conditions that decide success never make it into the JD at all. So once you have a list, it’s best to screen it again against your broken-down requirements, then pick up the phone to fill in what paper can’t show.",
    ],
    [
      "Does a candidate need to meet every requirement in the JD?",
      "No. First sort the requirements into must-haves, core skills, industry background and nice-to-haves. Only the must-haves rule someone out. Nice-to-haves are for ranking, not for screening people out. Once they’re sorted, it’s best to confirm them with the hiring manager: a must-have in the JD is sometimes only a nice-to-have in their mind.",
    ],
  ],
};
