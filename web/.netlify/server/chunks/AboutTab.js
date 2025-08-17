import "clsx";
import { c as attr_class, p as pop, a as push, d as attr_style, e as escape_html, f as stringify, i as ensure_array_like, b as attr, m as maybe_selected, j as bind_props, k as copy_payload, l as assign_payload } from "./index.js";
/* empty css                                       */
function HeroSection($$payload, $$props) {
  push();
  let isVisible = false;
  $$payload.out.push(`<section${attr_class("hero svelte-bfopon", void 0, { "visible": isVisible })}><div class="hero-content svelte-bfopon"><h1 class="hero-title svelte-bfopon">About The Kinetic Alphabet</h1> <p class="hero-subtitle svelte-bfopon">Innovation in Flow Arts Education</p></div></section> <section class="philosophy svelte-bfopon"><div class="container svelte-bfopon"><h2 class="svelte-bfopon">Philosophy</h2> <div class="philosophy-content svelte-bfopon"><p class="svelte-bfopon">The Kinetic Alphabet represents a paradigm shift in how flow artists
        approach their craft. By providing a systematic framework for
        understanding movement, we enable practitioners to develop deeper
        technical skills while preserving the artistic freedom that defines flow
        arts.</p> <p class="svelte-bfopon">Our approach combines rigorous technical methodology with creative
        expression, allowing artists to build a solid foundation while exploring
        infinite possibilities for personal artistic development.</p></div></div></section>`);
  pop();
}
function QuickAccess($$payload) {
  $$payload.out.push(`<section class="quick-access svelte-1fvsc2s"><div class="container svelte-1fvsc2s"><h2 class="svelte-1fvsc2s">Quick Access</h2> <div class="quick-grid svelte-1fvsc2s"><button class="quick-link constructor svelte-1fvsc2s"><div class="quick-icon svelte-1fvsc2s">🔧</div> <div class="quick-content svelte-1fvsc2s"><h3 class="svelte-1fvsc2s">Start Creating</h3> <p class="svelte-1fvsc2s">Jump into the constructor</p></div></button> <a href="https://drive.google.com/file/d/1cgAWbrFiLgUSDEsCB0Mmu2d7Bu5PW45a/view?usp=drive_link" target="_blank" rel="noopener noreferrer" class="quick-link learn svelte-1fvsc2s"><div class="quick-icon svelte-1fvsc2s">📚</div> <div class="quick-content svelte-1fvsc2s"><h3 class="svelte-1fvsc2s">Learn the Basics</h3> <p class="svelte-1fvsc2s">Download Level 1 PDF</p></div></a> <a href="https://github.com/austencloud/tka-sequence-constructor/releases/download/v0.1.2/TKA_Setup.exe" class="quick-link download svelte-1fvsc2s" target="_blank" rel="noopener noreferrer"><div class="quick-icon svelte-1fvsc2s">⬇️</div> <div class="quick-content svelte-1fvsc2s"><h3 class="svelte-1fvsc2s">Get Desktop App</h3> <p class="svelte-1fvsc2s">Download v0.1.2</p></div></a></div></div></section>`);
}
function ProjectOverview($$payload) {
  $$payload.out.push(`<section class="project-overview svelte-172t74w"><div class="container svelte-172t74w"><h2 class="svelte-172t74w">The Project</h2> <div class="overview-grid svelte-172t74w"><div class="overview-card svelte-172t74w"><h3 class="svelte-172t74w">🎯 Mission</h3> <p class="svelte-172t74w">To provide systematic tools and methodologies that enhance technical
          precision and creative expression in flow arts through structured
          learning approaches.</p></div> <div class="overview-card svelte-172t74w"><h3 class="svelte-172t74w">🔬 Methodology</h3> <p class="svelte-172t74w">The system breaks down complex movements into understandable
          components, creating a notation system that enables precise
          communication and analysis.</p></div> <div class="overview-card svelte-172t74w"><h3 class="svelte-172t74w">🌟 Vision</h3> <p class="svelte-172t74w">A global community of flow artists connected through shared language
          and collaborative tools for sequence creation and knowledge sharing.</p></div> <div class="overview-card svelte-172t74w"><h3 class="svelte-172t74w">🛠️ Tools</h3> <p class="svelte-172t74w">Digital applications that support visualization, creation, and sharing
          of choreographic sequences across multiple flow art disciplines.</p></div></div></div></section>`);
}
function Features($$payload) {
  $$payload.out.push(`<section class="features svelte-1ck0ztp"><div class="container svelte-1ck0ztp"><h2 class="svelte-1ck0ztp">The Kinetic Alphabet Features</h2> <div class="features-grid svelte-1ck0ztp"><div class="feature-card svelte-1ck0ztp"><div class="feature-icon svelte-1ck0ztp">📚</div> <h3 class="svelte-1ck0ztp">Systematic Learning</h3> <p class="svelte-1ck0ztp">Complex movements are broken down into understandable components
          through a structured notation system.</p></div> <div class="feature-card svelte-1ck0ztp"><div class="feature-icon svelte-1ck0ztp">🎯</div> <h3 class="svelte-1ck0ztp">Precision Training</h3> <p class="svelte-1ck0ztp">The system supports muscle memory development and technical precision
          through methodical movement approaches.</p></div> <div class="feature-card svelte-1ck0ztp"><div class="feature-icon svelte-1ck0ztp">🔧</div> <h3 class="svelte-1ck0ztp">Digital Tools</h3> <p class="svelte-1ck0ztp">The Kinetic Constructor enables visualization, creation, and sharing
          of choreographic sequences.</p></div> <div class="feature-card svelte-1ck0ztp"><div class="feature-icon svelte-1ck0ztp">🌟</div> <h3 class="svelte-1ck0ztp">Creative Framework</h3> <p class="svelte-1ck0ztp">The system provides foundational knowledge that enables exploration of
          infinite sequence possibilities.</p></div></div></div></section>`);
}
function GettingStarted($$payload) {
  $$payload.out.push(`<section class="getting-started svelte-1rn3fmz"><div class="container svelte-1rn3fmz"><h2 class="svelte-1rn3fmz">Getting Started</h2> <div class="steps-grid svelte-1rn3fmz"><div class="step svelte-1rn3fmz"><div class="step-number svelte-1rn3fmz">1</div> <h3 class="svelte-1rn3fmz">Download the PDF</h3> <p class="svelte-1rn3fmz">The comprehensive Level 1 guide introduces core concepts and
          foundational principles.</p></div> <div class="step svelte-1rn3fmz"><div class="step-number svelte-1rn3fmz">2</div> <h3 class="svelte-1rn3fmz">Practice the Basics</h3> <p class="svelte-1rn3fmz">Fundamental movements and notation system can be learned through
          guided exercises.</p></div> <div class="step svelte-1rn3fmz"><div class="step-number svelte-1rn3fmz">3</div> <h3 class="svelte-1rn3fmz">Use the Constructor</h3> <p class="svelte-1rn3fmz">The web-based constructor allows creation and visualization of custom
          sequences.</p></div> <div class="step svelte-1rn3fmz"><div class="step-number svelte-1rn3fmz">4</div> <h3 class="svelte-1rn3fmz">Join the Community</h3> <p class="svelte-1rn3fmz">Connect with flow artists and share creations through our growing
          community platform.</p></div></div></div></section>`);
}
function createModalState() {
  let isOpen = false;
  let resourceName = null;
  let modalData = null;
  function openModalWithResource(name) {
    resourceName = name;
    isOpen = true;
  }
  function closeModalAndCleanup() {
    isOpen = false;
    resourceName = null;
    modalData = null;
  }
  function setModalData(data) {
    modalData = data;
  }
  function initialize() {
  }
  return {
    // Reactive getters
    get isOpen() {
      return isOpen;
    },
    get resourceName() {
      return resourceName;
    },
    get modalData() {
      return modalData;
    },
    // Actions
    openModal: openModalWithResource,
    closeModal: closeModalAndCleanup,
    setModalData,
    initialize
  };
}
function ResourceModal($$payload, $$props) {
  push();
  let {
    isOpen = false,
    modalData = null,
    children
  } = $$props;
  let currentSection = "";
  const data = modalData;
  if (isOpen) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="modal-overlay svelte-ueu0vt" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" tabindex="-1"><div class="modal-container svelte-ueu0vt"><button class="modal-close svelte-ueu0vt" aria-label="Close modal" type="button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> `);
    {
      $$payload.out.push("<!--[!-->");
      if (data) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="resource-content svelte-ueu0vt"><header class="resource-header svelte-ueu0vt"${attr_style(`background: ${stringify(data.heroGradient)}`)}><div class="header-content svelte-ueu0vt"><h1 id="modal-title" class="resource-title svelte-ueu0vt">${escape_html(data.title)}</h1> <p class="resource-subtitle svelte-ueu0vt">${escape_html(data.subtitle)}</p> <div class="resource-meta svelte-ueu0vt"><span class="creator-badge svelte-ueu0vt"${attr_style(`color: ${stringify(data.creatorColor)}`)}>${escape_html(data.creator)}</span> <span class="category-badge svelte-ueu0vt">${escape_html(data.category)}</span> <span class="level-badge svelte-ueu0vt">${escape_html(data.level)}</span></div></div></header> `);
        if (data.tableOfContents && data.tableOfContents.length > 0) {
          $$payload.out.push("<!--[-->");
          const each_array = ensure_array_like(data.tableOfContents);
          $$payload.out.push(`<nav class="resource-nav svelte-ueu0vt" aria-label="Resource sections"><div class="nav-links svelte-ueu0vt"><!--[-->`);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let section = each_array[$$index];
            $$payload.out.push(`<a${attr("href", `#${stringify(section.id)}`)}${attr_class("nav-link svelte-ueu0vt", void 0, { "active": currentSection === section.id })}>${escape_html(section.label)}</a>`);
          }
          $$payload.out.push(`<!--]--></div></nav>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--> <main class="resource-main svelte-ueu0vt" id="modal-description">`);
        children?.($$payload);
        $$payload.out.push(`<!----></main> `);
        if (data.relatedResources && data.relatedResources.length > 0) {
          $$payload.out.push("<!--[-->");
          const each_array_1 = ensure_array_like(data.relatedResources);
          $$payload.out.push(`<aside class="related-resources svelte-ueu0vt"><h3 class="svelte-ueu0vt">Related Resources</h3> <div class="related-links svelte-ueu0vt"><!--[-->`);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let related = each_array_1[$$index_1];
            $$payload.out.push(`<a${attr("href", related.url)}${attr_class("related-link svelte-ueu0vt", void 0, { "internal": related.type === "internal" })}${attr("target", related.type === "external" ? "_blank" : "_self")}${attr("rel", related.type === "external" ? "noopener noreferrer" : "")}><span class="related-name svelte-ueu0vt">${escape_html(related.name)}</span> <span class="related-description svelte-ueu0vt">${escape_html(related.description)}</span></a>`);
          }
          $$payload.out.push(`<!--]--></div></aside>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--> <footer class="resource-footer svelte-ueu0vt"><a${attr("href", data.url)} target="_blank" rel="noopener noreferrer" class="visit-original svelte-ueu0vt">Visit Original Resource →</a></footer></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<div class="modal-error svelte-ueu0vt"><h2 class="svelte-ueu0vt">Resource Not Found</h2> <p>The requested resource could not be loaded.</p></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function VTGContent($$payload) {
  $$payload.out.push(`<section id="overview" class="content-section svelte-1c86lzw"><h2 class="svelte-1c86lzw">Overview</h2> <p class="svelte-1c86lzw">The Vulcan Tech Gospel (VTG) represents one of the most significant
    theoretical frameworks in modern poi spinning, developed by <strong>Noel Yee</strong> in the early 2000s. This comprehensive system provides a structured approach
    to understanding and executing technical poi movements, particularly focusing
    on the concept of "poi flowers" and seamless transitions between different spinning
    planes.</p> <p class="svelte-1c86lzw">VTG emerged during a pivotal period in poi evolution when the community was
    transitioning from traditional fire spinning to more technical,
    dance-oriented approaches. Noel Yee's background in mathematics and movement
    analysis enabled him to codify what many spinners were discovering
    intuitively, creating a shared language for technical poi concepts.</p> <div class="highlight-box svelte-1c86lzw"><h3 class="svelte-1c86lzw">Why VTG Matters</h3> <p class="svelte-1c86lzw">VTG provides the theoretical foundation that enables poi spinners to
      understand the geometric relationships between different movements, making
      it possible to create smooth, flowing sequences that would otherwise
      require years of trial-and-error to discover.</p></div></section> <section id="key-concepts" class="content-section svelte-1c86lzw"><h2 class="svelte-1c86lzw">Key Concepts</h2> <div class="concept-grid svelte-1c86lzw"><div class="concept-card svelte-1c86lzw"><h3 class="svelte-1c86lzw">Poi Flowers</h3> <p class="svelte-1c86lzw">The central concept of VTG, poi flowers describe the geometric patterns
        created when poi move through specific orbital relationships. These
        patterns form the building blocks for more complex movements.</p></div> <div class="concept-card svelte-1c86lzw"><h3 class="svelte-1c86lzw">Transition Theory</h3> <p class="svelte-1c86lzw">VTG provides systematic methods for moving between different spinning
        planes and patterns while maintaining flow and avoiding tangles.</p></div> <div class="concept-card svelte-1c86lzw"><h3 class="svelte-1c86lzw">Geometric Relationships</h3> <p class="svelte-1c86lzw">Understanding how poi move in three-dimensional space relative to the
        body and each other, enabling predictable and repeatable movements.</p></div> <div class="concept-card svelte-1c86lzw"><h3 class="svelte-1c86lzw">Timing and Rhythm</h3> <p class="svelte-1c86lzw">VTG emphasizes the importance of consistent timing in creating clean
        transitions and maintaining the integrity of patterns.</p></div></div></section> <section id="getting-started" class="content-section svelte-1c86lzw"><h2 class="svelte-1c86lzw">Getting Started with VTG</h2> <div class="getting-started-content svelte-1c86lzw"><h3 class="svelte-1c86lzw">Prerequisites</h3> <ul class="svelte-1c86lzw"><li class="svelte-1c86lzw">Solid foundation in basic poi movements (weaves, butterflies, windmills)</li> <li class="svelte-1c86lzw">Comfortable with both same-direction and opposite-direction spinning</li> <li class="svelte-1c86lzw">Understanding of basic poi terminology and hand positions</li> <li class="svelte-1c86lzw">Ability to maintain consistent timing and rhythm</li></ul> <h3 class="svelte-1c86lzw">Essential Practice Sequence</h3> <ol class="svelte-1c86lzw"><li class="svelte-1c86lzw"><strong>Master the Basic Flower:</strong> Start with simple same-direction
        flowers in the wall plane</li> <li class="svelte-1c86lzw"><strong>Explore Plane Variations:</strong> Practice flowers in wheel and
        floor planes</li> <li class="svelte-1c86lzw"><strong>Transition Practice:</strong> Work on moving between planes while
        maintaining flower integrity</li> <li class="svelte-1c86lzw"><strong>Timing Refinement:</strong> Focus on consistent beat timing throughout
        transitions</li> <li class="svelte-1c86lzw"><strong>Pattern Integration:</strong> Combine flowers with traditional poi
        movements</li></ol> <div class="practice-tip svelte-1c86lzw"><h4 class="svelte-1c86lzw">Practice Tip</h4> <p class="svelte-1c86lzw">Start with very slow, deliberate movements. VTG concepts become much
        clearer when you can observe the geometric relationships without the
        distraction of speed. Gradually increase tempo only after the movements
        become second nature.</p></div></div></section> <section id="advanced-applications" class="content-section svelte-1c86lzw"><h2 class="svelte-1c86lzw">Advanced Applications</h2> <p class="svelte-1c86lzw">Once you've mastered the fundamental VTG concepts, the system opens up a
    vast landscape of advanced possibilities. These applications represent the
    cutting edge of technical poi spinning and continue to influence new
    developments in the art form.</p> <h3 class="svelte-1c86lzw">Complex Flower Variations</h3> <ul class="svelte-1c86lzw"><li class="svelte-1c86lzw"><strong>Multi-Plane Flowers:</strong> Flowers that span multiple planes simultaneously</li> <li class="svelte-1c86lzw"><strong>Asymmetric Patterns:</strong> Flowers with different timing or geometry
      for each hand</li> <li class="svelte-1c86lzw"><strong>Nested Flowers:</strong> Smaller flower patterns embedded within larger
      ones</li> <li class="svelte-1c86lzw"><strong>Dynamic Scaling:</strong> Flowers that change size and shape during
      execution</li></ul> <h3 class="svelte-1c86lzw">Integration with Other Systems</h3> <p class="svelte-1c86lzw">VTG serves as a foundation that can be combined with other theoretical
    frameworks:</p> <ul class="svelte-1c86lzw"><li class="svelte-1c86lzw"><strong>9-Square Theory:</strong> Charlie Cushing's system builds directly
      on VTG principles</li> <li class="svelte-1c86lzw"><strong>Contact Poi:</strong> VTG transitions adapted for body contact movements</li> <li class="svelte-1c86lzw"><strong>Fire Performance:</strong> Safety-conscious applications of VTG for
      fire spinning</li> <li class="svelte-1c86lzw"><strong>LED and Visual Poi:</strong> VTG patterns optimized for visual impact</li></ul> <div class="advanced-tip svelte-1c86lzw"><h4 class="svelte-1c86lzw">Advanced Practice Focus</h4> <p class="svelte-1c86lzw">At advanced levels, VTG becomes less about specific movements and more
      about understanding the underlying principles that govern poi motion. This
      understanding allows for real-time improvisation and the creation of
      entirely new patterns.</p></div></section> <section id="community-impact" class="content-section svelte-1c86lzw"><h2 class="svelte-1c86lzw">Community Impact &amp; Legacy</h2> <p class="svelte-1c86lzw">The introduction of VTG marked a watershed moment in poi history,
    transforming the art form from an intuitive practice to a systematic
    discipline. Its impact extends far beyond individual technique improvement,
    fundamentally changing how the poi community approaches learning and
    teaching.</p> <h3 class="svelte-1c86lzw">Educational Revolution</h3> <p class="svelte-1c86lzw">Before VTG, poi instruction relied heavily on imitation and personal
    discovery. VTG provided the first comprehensive framework that allowed
    instructors to break down complex movements into teachable components,
    dramatically accelerating the learning process for new spinners.</p> <h3 class="svelte-1c86lzw">Theoretical Foundation</h3> <p class="svelte-1c86lzw">VTG established poi as a legitimate movement discipline with its own
    theoretical framework, comparable to dance or martial arts. This legitimacy
    helped poi gain recognition in academic and artistic circles, leading to
    university courses and formal performance opportunities.</p> <h3 class="svelte-1c86lzw">Innovation Catalyst</h3> <p class="svelte-1c86lzw">By providing a common language and theoretical foundation, VTG enabled rapid
    innovation in poi technique. Spinners could now build systematically on each
    other's work rather than starting from scratch, leading to an explosion of
    new techniques and styles.</p> <div class="impact-stats svelte-1c86lzw"><h4 class="svelte-1c86lzw">Measurable Impact</h4> <ul class="svelte-1c86lzw"><li class="svelte-1c86lzw">Adopted by major poi communities worldwide within 5 years of publication</li> <li class="svelte-1c86lzw">Referenced in over 100 poi tutorial videos and instructional materials</li> <li class="svelte-1c86lzw">Foundation for at least 6 subsequent theoretical frameworks</li> <li class="svelte-1c86lzw">Taught in poi workshops across 20+ countries</li></ul></div></section> <section id="official-resources" class="content-section svelte-1c86lzw"><h2 class="svelte-1c86lzw">Official Resources &amp; Further Learning</h2> <p class="svelte-1c86lzw">To truly master VTG, it's essential to study the original materials and
    engage with the broader community of practitioners. These resources provide
    authoritative information and ongoing support for your VTG journey.</p> <div class="resource-links svelte-1c86lzw"><h3 class="svelte-1c86lzw">Primary Sources</h3> <div class="link-grid svelte-1c86lzw"><a href="https://noelyee.com/instruction/vulcan-tech-gospel/" target="_blank" rel="noopener noreferrer" class="resource-link primary svelte-1c86lzw"><h4 class="svelte-1c86lzw">Noel Yee's Official VTG Documentation</h4> <p class="svelte-1c86lzw">The original and most authoritative source for VTG theory and practice</p> <span class="link-indicator svelte-1c86lzw">Visit Resource →</span></a> <a href="https://playpoi.com/lessons/intermediate/vulcan-tech-gospel/" target="_blank" rel="noopener noreferrer" class="resource-link svelte-1c86lzw"><h4 class="svelte-1c86lzw">Playpoi VTG Lessons</h4> <p class="svelte-1c86lzw">Community-driven tutorials and discussions expanding on VTG concepts</p> <span class="link-indicator svelte-1c86lzw">Visit Resource →</span></a> <a href="https://www.spinmorepoi.com/intermediate/vulcan-tech-gospel/" target="_blank" rel="noopener noreferrer" class="resource-link svelte-1c86lzw"><h4 class="svelte-1c86lzw">Spin More Poi VTG Section</h4> <p class="svelte-1c86lzw">Structured practice sequences and progressive skill development</p> <span class="link-indicator svelte-1c86lzw">Visit Resource →</span></a></div> <h3 class="svelte-1c86lzw">Video Tutorials</h3> <div class="link-grid svelte-1c86lzw"><a href="https://www.youtube.com/results?search_query=vulcan+tech+gospel+poi+tutorial" target="_blank" rel="noopener noreferrer" class="resource-link svelte-1c86lzw"><h4 class="svelte-1c86lzw">YouTube VTG Tutorials</h4> <p class="svelte-1c86lzw">Visual demonstrations and step-by-step breakdowns</p> <span class="link-indicator svelte-1c86lzw">Visit Resource →</span></a> <a href="https://drexfactor.com/tutorials/vulcan-tech-gospel" target="_blank" rel="noopener noreferrer" class="resource-link svelte-1c86lzw"><h4 class="svelte-1c86lzw">DrexFactor VTG Analysis</h4> <p class="svelte-1c86lzw">Technical analysis and advanced applications</p> <span class="link-indicator svelte-1c86lzw">Visit Resource →</span></a></div> <h3 class="svelte-1c86lzw">Community Discussion</h3> <div class="link-grid svelte-1c86lzw"><a href="https://www.reddit.com/r/poi/search/?q=vulcan%20tech%20gospel" target="_blank" rel="noopener noreferrer" class="resource-link svelte-1c86lzw"><h4 class="svelte-1c86lzw">Reddit Poi Community</h4> <p class="svelte-1c86lzw">Active discussions, questions, and shared experiences</p> <span class="link-indicator svelte-1c86lzw">Visit Resource →</span></a> <a href="https://www.facebook.com/groups/poispinners" target="_blank" rel="noopener noreferrer" class="resource-link svelte-1c86lzw"><h4 class="svelte-1c86lzw">Facebook Poi Groups</h4> <p class="svelte-1c86lzw">Global community sharing VTG insights and variations</p> <span class="link-indicator svelte-1c86lzw">Visit Resource →</span></a></div></div></section>`);
}
const resources = [
  // ACTIVE LEARNING RESOURCES
  {
    name: "Vulcan Tech Gospel (VTG)",
    description: "Foundational theory for poi tech, poi flowers, and transition theory developed by Noel Yee.",
    url: "https://noelyee.com/instruction/vulcan-tech-gospel/",
    category: "active-learning",
    level: "intermediate",
    value: "Essential theoretical framework that forms the backbone of modern technical poi spinning.",
    status: "active",
    lastUpdated: "2023",
    hasLandingPage: true,
    landingPageUrl: "/links/vulcan-tech-gospel",
    modalType: "educational"
  },
  {
    name: "Charlie Cushing's 9 Square Theory",
    description: "Advanced framework for connecting unit circles in technical poi, developed by former helicopter pilot Charlie Cushing.",
    url: "https://www.spinmorepoi.com/advanced/",
    category: "active-learning",
    level: "advanced",
    value: "Revolutionary approach to understanding poi transitions and spatial relationships.",
    status: "active",
    lastUpdated: "2023",
    hasLandingPage: true,
    landingPageUrl: "/links/charlie-cushing-9-square-theory",
    modalType: "educational"
  },
  {
    name: "Flow Arts Institute",
    description: "Educational platform exploring the phenomena of flow arts and providing comprehensive learning resources.",
    url: "https://flowartsinstitute.com/",
    category: "active-learning",
    level: "all",
    value: "Academic approach to understanding flow state and movement theory in flow arts.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational"
  },
  {
    name: "Playpoi",
    description: "Community-driven platform with extensive tutorials, courses, and educational content for poi spinning.",
    url: "https://playpoi.com/",
    category: "active-learning",
    level: "all",
    value: "Long-standing pillar of the poi community with comprehensive learning materials.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational"
  },
  {
    name: "The Kinetic Alphabet",
    description: "Revolutionary choreography notation system providing a systematic framework for flow arts movement documentation and sharing.",
    url: "/",
    category: "active-learning",
    level: "all",
    value: "Innovative approach to documenting and sharing flow arts choreography with structured notation - the core offering of this website.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational"
  },
  // ACTIVE COMMUNITY PLATFORMS
  {
    name: "Reddit Flow Arts Community",
    description: "Active discussion platform covering poi, staff, fans, hoops, and all flow arts disciplines.",
    url: "https://www.reddit.com/r/flowarts/",
    category: "active-community",
    level: "all",
    value: "Vibrant community for sharing videos, asking questions, and connecting with flow artists worldwide.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational"
  },
  {
    name: "Facebook Flow Arts Groups",
    description: "Various active Facebook groups for different flow arts communities and regional scenes.",
    url: "https://www.facebook.com/",
    category: "active-community",
    level: "all",
    value: "Regional and discipline-specific communities for local connections and sharing.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational"
  },
  {
    name: "Discord Communities",
    description: "Real-time chat communities for flow artists, including general flow arts and specialized servers.",
    url: "https://discord.com/",
    category: "active-community",
    level: "all",
    value: "Live discussion and community interaction with fellow flow artists.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational"
  },
  // FLOW ARTS VENDORS & EQUIPMENT
  {
    name: "Flowtoys",
    description: "Premium LED flow props including poi, staffs, clubs, and hoops with innovative technology.",
    url: "https://flowtoys.com/",
    category: "vendors",
    level: "all",
    value: "Industry leader in LED flow props with exceptional build quality and customer service.",
    status: "vendor",
    foundingYear: 2005,
    lastUpdated: "2024",
    specialties: [
      "LED Poi",
      "LED Staffs",
      "LED Clubs",
      "LED Hoops",
      "Capsule Handles"
    ],
    companyLocation: "USA",
    modalType: "vendor"
  },
  {
    name: "Lanternsmith",
    description: "Premium practice poi and fire poi crafted by Charlie Cushing, creator of 9 Square Theory.",
    url: "https://www.lanternsmith.com/",
    category: "vendors",
    level: "all",
    value: "Exceptional quality poi designed by a master practitioner with deep understanding of poi mechanics.",
    status: "vendor",
    foundingYear: 2008,
    lastUpdated: "2024",
    specialties: ["Practice Poi", "Fire Poi", "Custom Poi", "Poi Chains"],
    companyLocation: "USA",
    modalType: "vendor"
  },
  {
    name: "Cathedral Firetoys",
    description: "UK-based supplier of flow arts equipment, fire performance gear, and juggling props.",
    url: "https://www.cathedralfiretoys.co.uk/",
    category: "vendors",
    level: "all",
    value: "Reliable European supplier with extensive catalog and good shipping options.",
    status: "vendor",
    foundingYear: 2001,
    lastUpdated: "2024",
    specialties: ["Fire Props", "Practice Props", "Safety Gear", "Juggling"],
    companyLocation: "UK",
    modalType: "vendor"
  },
  {
    name: "Home of Poi",
    description: "Australian flow arts retailer specializing in poi, staffs, and performance accessories.",
    url: "https://www.homeofpoi.com/",
    category: "vendors",
    level: "all",
    value: "Long-established supplier with good selection and community connections.",
    status: "vendor",
    foundingYear: 2e3,
    lastUpdated: "2024",
    specialties: ["Poi", "Staffs", "Fire Safety", "Performance Gear"],
    companyLocation: "Australia",
    modalType: "vendor"
  },
  // HISTORICAL ARCHIVES
  {
    name: "The Poi Page (Archive)",
    description: "Historical archive of Malcolm's original poi instruction site, one of the foundational resources of the online poi community.",
    url: "https://web.archive.org/web/20050404064746/http://www.poipage.com/",
    category: "historical-archives",
    level: "all",
    value: "Historical significance as one of the first comprehensive online poi instruction resources.",
    status: "historical",
    lastUpdated: "2005",
    modalType: "archive"
  },
  {
    name: "Original Glowsticking.com Archive",
    description: "Archive of the influential glowsticking community site that documented rave culture flow arts.",
    url: "https://web.archive.org/web/20041010000000*/glowsticking.com",
    category: "historical-archives",
    level: "all",
    value: "Important documentation of rave scene flow arts culture and early LED flow props.",
    status: "historical",
    lastUpdated: "2004",
    modalType: "archive"
  },
  {
    name: "Spinning.org Archive",
    description: "Historical poi community forum and resource archive from the early 2000s.",
    url: "https://web.archive.org/web/20050301000000*/spinning.org",
    category: "historical-archives",
    level: "all",
    value: "Archive of early poi community discussions and tutorial development.",
    status: "historical",
    lastUpdated: "2005",
    modalType: "archive"
  }
];
const categories = [
  { value: "all", label: "All Resources" },
  { value: "active-learning", label: "Learning Resources" },
  { value: "active-community", label: "Community" },
  { value: "vendors", label: "Equipment & Vendors" },
  { value: "historical-archives", label: "Historical Archives" }
];
const levels = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
];
function ResourceFilters($$payload, $$props) {
  push();
  let {
    searchTerm = "",
    selectedCategory = "all",
    selectedLevel = "all"
  } = $$props;
  function getResourceCountForCategory(categoryValue) {
    if (categoryValue === "all") {
      return resources.length;
    }
    return resources.filter((resource) => resource.category === categoryValue).length;
  }
  const each_array = ensure_array_like(levels);
  const each_array_1 = ensure_array_like(categories);
  $$payload.out.push(`<div class="filters-section svelte-15gdtxg"><div class="search-section svelte-15gdtxg"><div class="search-container svelte-15gdtxg"><input type="text" placeholder="Search resources..."${attr("value", searchTerm)} class="search-input svelte-15gdtxg"/> <span class="search-icon svelte-15gdtxg">🔍</span></div></div> <div class="level-filter svelte-15gdtxg"><label for="level-select" class="svelte-15gdtxg">Level:</label> <select id="level-select" class="svelte-15gdtxg">`);
  $$payload.select_value = selectedLevel;
  $$payload.out.push(`<!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let level = each_array[$$index];
    $$payload.out.push(`<option${attr("value", level.value)}${maybe_selected($$payload, level.value)}>${escape_html(level.label)}</option>`);
  }
  $$payload.out.push(`<!--]-->`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div> <nav class="categories-nav svelte-15gdtxg" aria-label="Resource categories"><!--[-->`);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let category = each_array_1[$$index_1];
    $$payload.out.push(`<button type="button"${attr_class("category-tab svelte-15gdtxg", void 0, { "active": selectedCategory === category.value })}${attr("aria-pressed", selectedCategory === category.value)}><span class="tab-label svelte-15gdtxg">${escape_html(category.label)}</span> <span class="tab-count svelte-15gdtxg">(${escape_html(getResourceCountForCategory(category.value))})</span></button>`);
  }
  $$payload.out.push(`<!--]--></nav></div>`);
  bind_props($$props, { searchTerm, selectedCategory, selectedLevel });
  pop();
}
function ResourceCard($$payload, $$props) {
  push();
  const { resource } = $$props;
  function getStatusIcon(status) {
    switch (status) {
      case "vendor":
        return "🏪";
      case "historical":
        return "📚";
      default:
        return "✨";
    }
  }
  function getCategoryLabel(categoryValue) {
    return categories.find((c) => c.value === categoryValue)?.label || categoryValue;
  }
  $$payload.out.push(`<article class="resource-card svelte-15wfyfi"><div class="resource-header svelte-15wfyfi"><div class="resource-title-row svelte-15wfyfi"><h3 class="resource-title svelte-15wfyfi"><a${attr("href", resource.url)} target="_blank" rel="noopener noreferrer" class="svelte-15wfyfi">${escape_html(resource.name)}</a></h3> <span${attr_class(`status-indicator status-${stringify(resource.status)}`, "svelte-15wfyfi")}>${escape_html(getStatusIcon(resource.status))}</span></div> <div class="resource-meta svelte-15wfyfi"><span${attr_class(`category-badge category-${stringify(resource.category)}`, "svelte-15wfyfi")}>${escape_html(getCategoryLabel(resource.category))}</span> `);
  if (resource.status === "vendor" && resource.foundingYear) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<span class="founding-badge svelte-15wfyfi">Est. ${escape_html(resource.foundingYear)}</span>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (resource.lastUpdated) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<span class="last-updated-indicator svelte-15wfyfi">Updated ${escape_html(resource.lastUpdated)}</span>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div> <p class="resource-description svelte-15wfyfi">${escape_html(resource.description)}</p> `);
  if (resource.status === "vendor" && resource.specialties) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(resource.specialties);
    $$payload.out.push(`<div class="vendor-specialties svelte-15wfyfi"><strong class="svelte-15wfyfi">Specialties:</strong> <div class="specialty-tags svelte-15wfyfi"><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let specialty = each_array[$$index];
      $$payload.out.push(`<span class="specialty-tag svelte-15wfyfi">${escape_html(specialty)}</span>`);
    }
    $$payload.out.push(`<!--]--></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div class="resource-value svelte-15wfyfi"><strong class="svelte-15wfyfi">${escape_html(resource.status === "vendor" ? "Why shop here:" : "Why it's essential:")}</strong> ${escape_html(resource.value)}</div> <div class="resource-actions svelte-15wfyfi"><a${attr("href", resource.url)} target="_blank" rel="noopener noreferrer" class="visit-btn svelte-15wfyfi">Visit ${escape_html(resource.status === "vendor" ? "Store" : resource.status === "historical" ? "Archive" : "Site")}</a> `);
  if (resource.hasLandingPage) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<button type="button" class="learn-more-btn svelte-15wfyfi">Learn More</button>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></article>`);
  pop();
}
function ResourceGrid($$payload, $$props) {
  push();
  const { resources: resources2, isLoading = false } = $$props;
  if (isLoading) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="loading-state svelte-4260jy"><div class="loading-spinner svelte-4260jy"></div> <p class="svelte-4260jy">Loading resources...</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (resources2.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="empty-state svelte-4260jy"><div class="empty-icon svelte-4260jy">🔍</div> <h3 class="svelte-4260jy">No resources found</h3> <p class="svelte-4260jy">Try adjusting your search criteria or filters.</p></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      const each_array = ensure_array_like(resources2);
      $$payload.out.push(`<div class="resource-grid svelte-4260jy"><!--[-->`);
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let resource = each_array[index];
        ResourceCard($$payload, { resource });
      }
      $$payload.out.push(`<!--]--></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function ResourcesHistorian($$payload, $$props) {
  push();
  let searchTerm = "";
  let selectedCategory = "all";
  let selectedLevel = "all";
  const modalState = createModalState();
  let filteredResources = (() => {
    return resources.filter((resource) => {
      const matchesSearch = searchTerm === "" || resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || resource.description.toLowerCase().includes(searchTerm.toLowerCase()) || resource.specialties && resource.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
      const matchesLevel = selectedLevel === "all" || resource.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  })();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<section class="resources-links svelte-hrg8ry"><div class="container svelte-hrg8ry"><h2 class="svelte-hrg8ry">Flow Arts Historian</h2> <p class="subtitle svelte-hrg8ry">Your comprehensive guide to flow arts resources, from cutting-edge
      learning platforms and active communities to essential vendors and
      historical archives preserving our art form's rich heritage.</p> `);
    ResourceFilters($$payload2, {
      get searchTerm() {
        return searchTerm;
      },
      set searchTerm($$value) {
        searchTerm = $$value;
        $$settled = false;
      },
      get selectedCategory() {
        return selectedCategory;
      },
      set selectedCategory($$value) {
        selectedCategory = $$value;
        $$settled = false;
      },
      get selectedLevel() {
        return selectedLevel;
      },
      set selectedLevel($$value) {
        selectedLevel = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----> `);
    ResourceGrid($$payload2, { resources: filteredResources });
    $$payload2.out.push(`<!----></div></section> `);
    ResourceModal($$payload2, {
      isOpen: modalState.isOpen,
      modalData: modalState.modalData,
      children: ($$payload3) => {
        if (modalState.resourceName === "vulcan-tech-gospel") {
          $$payload3.out.push("<!--[-->");
          VTGContent($$payload3);
        } else {
          $$payload3.out.push("<!--[!-->");
          if (modalState.resourceName === "charlie-cushing-9-square-theory") {
            $$payload3.out.push("<!--[-->");
            $$payload3.out.push(`<div class="placeholder-content svelte-hrg8ry"><p>9 Square Theory content coming soon...</p></div>`);
          } else {
            $$payload3.out.push("<!--[!-->");
          }
          $$payload3.out.push(`<!--]-->`);
        }
        $$payload3.out.push(`<!--]-->`);
      }
    });
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function ContactSection($$payload, $$props) {
  push();
  let formData = { name: "", email: "", subject: "", message: "" };
  let isSubmitting = false;
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/yourusername",
      icon: "github",
      description: "Source code and project repositories"
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@yourchannel",
      icon: "youtube",
      description: "Tutorial videos and flow arts content"
    },
    {
      name: "Instagram",
      url: "https://instagram.com/yourusername",
      icon: "instagram",
      description: "Visual content and community updates"
    },
    {
      name: "Discord",
      url: "https://discord.gg/yourinvite",
      icon: "discord",
      description: "Join our flow arts community"
    },
    {
      name: "Reddit",
      url: "https://reddit.com/r/flowarts",
      icon: "reddit",
      description: "Flow arts discussions and sharing"
    },
    {
      name: "Email",
      url: "mailto:contact@kineticalphabetproject.com",
      icon: "email",
      description: "Direct contact for inquiries"
    }
  ];
  const each_array = ensure_array_like(socialLinks);
  $$payload.out.push(`<section class="contact-section svelte-1lgk1lw"><div class="container svelte-1lgk1lw"><div class="contact-grid svelte-1lgk1lw"><div class="contact-info svelte-1lgk1lw"><h2 class="svelte-1lgk1lw">Get in Touch</h2> <p class="contact-description svelte-1lgk1lw">Have questions about The Kinetic Alphabet? Want to contribute to the
          project or share feedback? I'd love to hear from you!</p> <div class="contact-methods svelte-1lgk1lw"><div class="contact-method svelte-1lgk1lw"><div class="method-icon svelte-1lgk1lw"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></div> <div class="method-details svelte-1lgk1lw"><h3 class="svelte-1lgk1lw">Email</h3> <p class="svelte-1lgk1lw">contact@kineticalphabetproject.com</p> <span class="method-note svelte-1lgk1lw">Best for detailed inquiries and collaboration</span></div></div> <div class="contact-method svelte-1lgk1lw"><div class="method-icon svelte-1lgk1lw"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 19c-5 0-8-3-8-8s3-8 8-8 8 3 8 8-3 8-8 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 9a3 3 0 0 1 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 5a7 7 0 0 1 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></div> <div class="method-details svelte-1lgk1lw"><h3 class="svelte-1lgk1lw">Response Time</h3> <p class="svelte-1lgk1lw">24-48 hours typically</p> <span class="method-note svelte-1lgk1lw">I aim to respond to all messages promptly</span></div></div></div> <div class="social-section svelte-1lgk1lw"><h3 class="svelte-1lgk1lw">Connect &amp; Follow</h3> <p class="svelte-1lgk1lw">Join the community and stay updated with the latest developments:</p> <div class="social-grid svelte-1lgk1lw"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let social = each_array[$$index];
    $$payload.out.push(`<button class="social-link svelte-1lgk1lw" type="button"><div class="social-icon svelte-1lgk1lw">`);
    if (social.icon === "github") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (social.icon === "youtube") {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>`);
      } else {
        $$payload.out.push("<!--[!-->");
        if (social.icon === "instagram") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>`);
        } else {
          $$payload.out.push("<!--[!-->");
          if (social.icon === "discord") {
            $$payload.out.push("<!--[-->");
            $$payload.out.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0003 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"></path></svg>`);
          } else {
            $$payload.out.push("<!--[!-->");
            if (social.icon === "reddit") {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"></path></svg>`);
            } else {
              $$payload.out.push("<!--[!-->");
              if (social.icon === "email") {
                $$payload.out.push("<!--[-->");
                $$payload.out.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><polyline points="22,6 12,13 2,6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>`);
              } else {
                $$payload.out.push("<!--[!-->");
              }
              $$payload.out.push(`<!--]-->`);
            }
            $$payload.out.push(`<!--]-->`);
          }
          $$payload.out.push(`<!--]-->`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></div> <div class="social-content svelte-1lgk1lw"><span class="social-name svelte-1lgk1lw">${escape_html(social.name)}</span> <span class="social-description svelte-1lgk1lw">${escape_html(social.description)}</span></div></button>`);
  }
  $$payload.out.push(`<!--]--></div></div></div> <div class="contact-form-container svelte-1lgk1lw"><form class="contact-form svelte-1lgk1lw"><h3 class="svelte-1lgk1lw">Send a Message</h3> <div class="form-row svelte-1lgk1lw"><div class="form-group svelte-1lgk1lw"><label for="name" class="svelte-1lgk1lw">Name *</label> <input type="text" id="name"${attr("value", formData.name)} required placeholder="Your name" class="form-input svelte-1lgk1lw"/></div> <div class="form-group svelte-1lgk1lw"><label for="email" class="svelte-1lgk1lw">Email *</label> <input type="email" id="email"${attr("value", formData.email)} required placeholder="your.email@example.com" class="form-input svelte-1lgk1lw"/></div></div> <div class="form-group svelte-1lgk1lw"><label for="subject" class="svelte-1lgk1lw">Subject</label> <input type="text" id="subject"${attr("value", formData.subject)} placeholder="What's this about?" class="form-input svelte-1lgk1lw"/></div> <div class="form-group svelte-1lgk1lw"><label for="message" class="svelte-1lgk1lw">Message *</label> <textarea id="message" required placeholder="Tell me about your question, suggestion, or how you'd like to contribute..." rows="6" class="form-textarea svelte-1lgk1lw">`);
  const $$body = escape_html(formData.message);
  if ($$body) {
    $$payload.out.push(`${$$body}`);
  }
  $$payload.out.push(`</textarea></div> <button type="submit"${attr("disabled", isSubmitting, true)}${attr_class("submit-button svelte-1lgk1lw", void 0, { "submitting": isSubmitting })}>`);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`Send Message`);
  }
  $$payload.out.push(`<!--]--></button> `);
  {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></form></div></div></div></section>`);
  pop();
}
function AboutTab($$payload) {
  $$payload.out.push(`<div class="about-container svelte-82wuqb"><nav class="quick-nav svelte-82wuqb" aria-label="About page navigation"><div class="nav-content svelte-82wuqb"><span class="nav-title svelte-82wuqb">Quick Navigation:</span> <div class="nav-links svelte-82wuqb"><button class="nav-link svelte-82wuqb">Philosophy</button> <button class="nav-link svelte-82wuqb">Quick Access</button> <button class="nav-link svelte-82wuqb">Overview</button> <button class="nav-link svelte-82wuqb">Features</button> <button class="nav-link svelte-82wuqb">Getting Started</button> <button class="nav-link svelte-82wuqb">Resources</button> <button class="nav-link svelte-82wuqb">Contact</button></div></div></nav> <section id="hero" class="section-container svelte-82wuqb">`);
  HeroSection($$payload);
  $$payload.out.push(`<!----></section> <section id="quick-access" class="section-container svelte-82wuqb">`);
  QuickAccess($$payload);
  $$payload.out.push(`<!----></section> <section id="overview" class="section-container svelte-82wuqb">`);
  ProjectOverview($$payload);
  $$payload.out.push(`<!----></section> <section id="features" class="section-container svelte-82wuqb">`);
  Features($$payload);
  $$payload.out.push(`<!----></section> <section id="getting-started" class="section-container svelte-82wuqb">`);
  GettingStarted($$payload);
  $$payload.out.push(`<!----></section> <section id="resources" class="section-container svelte-82wuqb">`);
  ResourcesHistorian($$payload);
  $$payload.out.push(`<!----></section> <section id="contact" class="section-container svelte-82wuqb">`);
  ContactSection($$payload);
  $$payload.out.push(`<!----></section></div>`);
}
export {
  AboutTab as A
};
