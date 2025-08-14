import { b as attr, e as escape_html, c as ensure_array_like, d as attr_class, f as stringify, p as pop, a as push, h as head } from "../../../chunks/index.js";
import "clsx";
import { P as PngMetadataExtractor } from "../../../chunks/png-metadata-extractor.js";
function ThumbnailBrowser($$payload, $$props) {
  push();
  let { state } = $$props;
  $$payload.out.push(`<div class="thumbnail-browser svelte-1sr21pa"><div class="browser-header svelte-1sr21pa"><h2 class="svelte-1sr21pa">📁 Available Sequences</h2> <div class="header-actions svelte-1sr21pa"><button class="batch-analyze-btn svelte-1sr21pa"${attr("disabled", state.state.isLoadingThumbnails || state.state.isBatchAnalyzing || state.state.thumbnails.length === 0, true)}>`);
  if (state.state.isBatchAnalyzing) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`⏳ Analyzing...`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`🔍 Batch Analyze`);
  }
  $$payload.out.push(`<!--]--></button> <button class="refresh-btn svelte-1sr21pa"${attr("disabled", state.state.isLoadingThumbnails, true)}>${escape_html(state.state.isLoadingThumbnails ? "🔄" : "↻")} Refresh</button></div></div> <div class="thumbnail-grid-container svelte-1sr21pa">`);
  if (state.state.isLoadingThumbnails) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="loading-state svelte-1sr21pa"><div class="spinner svelte-1sr21pa"></div> <p class="svelte-1sr21pa">Loading thumbnails...</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (state.state.error) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="error-state svelte-1sr21pa"><p class="svelte-1sr21pa">❌ ${escape_html(state.state.error)}</p> <button class="retry-btn svelte-1sr21pa">Retry</button></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (state.state.thumbnails.length === 0) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="empty-state svelte-1sr21pa"><p class="svelte-1sr21pa">📭 No thumbnails found</p> <p class="help-text svelte-1sr21pa">Make sure PNG files are available in the static directories</p></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
        const each_array = ensure_array_like(state.state.thumbnails);
        $$payload.out.push(`<div class="thumbnail-grid svelte-1sr21pa"><!--[-->`);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let thumbnail = each_array[$$index];
          $$payload.out.push(`<button${attr_class("thumbnail-card svelte-1sr21pa", void 0, {
            "selected": state.state.selectedThumbnail?.path === thumbnail.path
          })}${attr("aria-label", `Select ${stringify(thumbnail.word)} sequence for metadata extraction`)}><div class="thumbnail-image svelte-1sr21pa"><img${attr("src", thumbnail.path)}${attr("alt", thumbnail.name)} loading="lazy" class="svelte-1sr21pa"/></div> <div class="thumbnail-info svelte-1sr21pa"><h3 class="sequence-name svelte-1sr21pa">${escape_html(thumbnail.word)}</h3> <p class="file-name svelte-1sr21pa">${escape_html(thumbnail.name)}</p></div></button>`);
        }
        $$payload.out.push(`<!--]--></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div> `);
  if (state.state.selectedThumbnail) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="selection-info svelte-1sr21pa"><p class="svelte-1sr21pa">📌 Selected: <strong class="svelte-1sr21pa">${escape_html(state.state.selectedThumbnail.word)}</strong></p> <button class="clear-btn svelte-1sr21pa">Clear Selection</button></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function MetadataDisplay($$payload, $$props) {
  push();
  let { state } = $$props;
  function isStartPosition(beat) {
    return !!beat.sequence_start_position;
  }
  function getRealBeats(metadata) {
    if (!Array.isArray(metadata)) return [];
    return metadata.filter((beat) => beat.letter && !beat.sequence_start_position);
  }
  $$payload.out.push(`<div class="metadata-display svelte-hkwrsd"><div class="display-header svelte-hkwrsd"><h2 class="svelte-hkwrsd">📊 Metadata Analysis</h2> `);
  if (state.state.rawMetadata) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<button class="copy-btn svelte-hkwrsd" title="Copy raw metadata to clipboard">📋 Copy</button>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <div class="display-content svelte-hkwrsd">`);
  if (state.state.isBatchAnalyzing) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="loading-state svelte-hkwrsd"><div class="spinner svelte-hkwrsd"></div> <p class="svelte-hkwrsd">Running batch analysis on all sequences...</p> <p class="loading-subtext svelte-hkwrsd">This may take a moment</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (state.state.isExtractingMetadata) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="loading-state svelte-hkwrsd"><div class="spinner svelte-hkwrsd"></div> <p class="svelte-hkwrsd">Extracting metadata...</p></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (state.state.error) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="error-state svelte-hkwrsd"><h3 class="svelte-hkwrsd">❌ Extraction Error</h3> <p class="svelte-hkwrsd">${escape_html(state.state.error)}</p></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
        if (!state.state.selectedThumbnail && !state.state.metadataStats) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<div class="empty-state svelte-hkwrsd"><h3 class="svelte-hkwrsd">🎯 Select a Sequence</h3> <p class="svelte-hkwrsd">Click on a thumbnail to extract and analyze its metadata, or use "Batch Analyze" to analyze all sequences</p></div>`);
        } else {
          $$payload.out.push("<!--[!-->");
          if (state.state.metadataStats) {
            $$payload.out.push("<!--[-->");
            if (state.state.metadataStats.isBatchSummary && state.state.metadataStats.batchSummary) {
              $$payload.out.push("<!--[-->");
              const each_array_2 = ensure_array_like(state.state.metadataStats.batchSummary.worstSequences);
              const each_array_3 = ensure_array_like(state.state.metadataStats.batchSummary.bestSequences);
              $$payload.out.push(`<div class="batch-summary svelte-hkwrsd"><h3 class="svelte-hkwrsd">📊 Batch Analysis Summary</h3> <div class="summary-grid svelte-hkwrsd"><div class="summary-card svelte-hkwrsd"><div class="summary-title svelte-hkwrsd">Sequences Analyzed</div> <div class="summary-value svelte-hkwrsd">${escape_html(state.state.metadataStats.batchSummary.sequencesAnalyzed)}</div></div> <div class="summary-card healthy svelte-hkwrsd"><div class="summary-title svelte-hkwrsd">Healthy Sequences</div> <div class="summary-value svelte-hkwrsd">${escape_html(state.state.metadataStats.batchSummary.healthySequences)}</div> <div class="summary-subtitle svelte-hkwrsd">(${escape_html(Math.round(state.state.metadataStats.batchSummary.healthySequences / state.state.metadataStats.batchSummary.sequencesAnalyzed * 100))}%)</div></div> <div class="summary-card unhealthy svelte-hkwrsd"><div class="summary-title svelte-hkwrsd">Unhealthy Sequences</div> <div class="summary-value svelte-hkwrsd">${escape_html(state.state.metadataStats.batchSummary.unhealthySequences)}</div> <div class="summary-subtitle svelte-hkwrsd">(${escape_html(Math.round(state.state.metadataStats.batchSummary.unhealthySequences / state.state.metadataStats.batchSummary.sequencesAnalyzed * 100))}%)</div></div> <div class="summary-card svelte-hkwrsd"><div class="summary-title svelte-hkwrsd">Average Health Score</div> <div class="summary-value svelte-hkwrsd">${escape_html(state.state.metadataStats.batchSummary.averageHealthScore)}%</div></div></div> <div class="summary-sections svelte-hkwrsd">`);
              if (state.state.metadataStats.batchSummary.totalErrors > 0) {
                $$payload.out.push("<!--[-->");
                const each_array = ensure_array_like(state.state.metadataStats.batchSummary.commonErrors);
                $$payload.out.push(`<div class="error-summary svelte-hkwrsd"><h4 class="svelte-hkwrsd">🚨 Most Common Errors (${escape_html(state.state.metadataStats.batchSummary.totalErrors)} total)</h4> <ul class="issue-list svelte-hkwrsd"><!--[-->`);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let [error, count] = each_array[$$index];
                  $$payload.out.push(`<li class="error-item svelte-hkwrsd"><span class="error-text svelte-hkwrsd">${escape_html(error)}</span> <span class="error-count svelte-hkwrsd">${escape_html(count)} sequences</span></li>`);
                }
                $$payload.out.push(`<!--]--></ul></div>`);
              } else {
                $$payload.out.push("<!--[!-->");
              }
              $$payload.out.push(`<!--]--> `);
              if (state.state.metadataStats.batchSummary.totalWarnings > 0) {
                $$payload.out.push("<!--[-->");
                const each_array_1 = ensure_array_like(state.state.metadataStats.batchSummary.commonWarnings);
                $$payload.out.push(`<div class="warning-summary svelte-hkwrsd"><h4 class="svelte-hkwrsd">⚠️ Most Common Warnings (${escape_html(state.state.metadataStats.batchSummary.totalWarnings)} total)</h4> <ul class="issue-list svelte-hkwrsd"><!--[-->`);
                for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                  let [warning, count] = each_array_1[$$index_1];
                  $$payload.out.push(`<li class="warning-item svelte-hkwrsd"><span class="warning-text svelte-hkwrsd">${escape_html(warning)}</span> <span class="warning-count svelte-hkwrsd">${escape_html(count)} sequences</span></li>`);
                }
                $$payload.out.push(`<!--]--></ul></div>`);
              } else {
                $$payload.out.push("<!--[!-->");
              }
              $$payload.out.push(`<!--]--> <div class="sequence-rankings svelte-hkwrsd"><div class="worst-sequences svelte-hkwrsd"><h4 class="svelte-hkwrsd">❌ Worst Health Scores</h4> <ul class="ranking-list svelte-hkwrsd"><!--[-->`);
              for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
                let sequence = each_array_2[$$index_2];
                $$payload.out.push(`<li class="ranking-item svelte-hkwrsd"><span class="sequence-name svelte-hkwrsd">${escape_html(sequence.sequence)}</span> <span${attr_class(`health-score score-${stringify(Math.floor(sequence.healthScore / 20))}`, "svelte-hkwrsd")}>${escape_html(sequence.healthScore)}%</span></li>`);
              }
              $$payload.out.push(`<!--]--></ul></div> <div class="best-sequences svelte-hkwrsd"><h4 class="svelte-hkwrsd">✅ Best Health Scores</h4> <ul class="ranking-list svelte-hkwrsd"><!--[-->`);
              for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
                let sequence = each_array_3[$$index_3];
                $$payload.out.push(`<li class="ranking-item svelte-hkwrsd"><span class="sequence-name svelte-hkwrsd">${escape_html(sequence.sequence)}</span> <span${attr_class(`health-score score-${stringify(Math.floor(sequence.healthScore / 20))}`, "svelte-hkwrsd")}>${escape_html(sequence.healthScore)}%</span></li>`);
              }
              $$payload.out.push(`<!--]--></ul></div></div></div></div>`);
            } else {
              $$payload.out.push("<!--[!-->");
              $$payload.out.push(`<div class="individual-sequence svelte-hkwrsd"><div class="metadata-summary svelte-hkwrsd"><h3 class="svelte-hkwrsd">📈 Analysis for ${escape_html(state.state.selectedThumbnail?.word || "Unknown")}</h3> <div${attr_class("health-score svelte-hkwrsd", void 0, {
                "excellent": state.state.metadataStats.healthScore >= 90,
                "good": state.state.metadataStats.healthScore >= 70 && state.state.metadataStats.healthScore < 90,
                "warning": state.state.metadataStats.healthScore >= 50 && state.state.metadataStats.healthScore < 70,
                "poor": state.state.metadataStats.healthScore < 50
              })}><div class="score-circle svelte-hkwrsd"><span class="score-value svelte-hkwrsd">${escape_html(state.state.metadataStats.healthScore)}</span> <span class="score-label svelte-hkwrsd">Health</span></div> <div class="score-details svelte-hkwrsd"><p class="score-text svelte-hkwrsd">`);
              if (state.state.metadataStats.healthScore >= 90) {
                $$payload.out.push("<!--[-->");
                $$payload.out.push(`✅ Excellent metadata quality`);
              } else {
                $$payload.out.push("<!--[!-->");
                if (state.state.metadataStats.healthScore >= 70) {
                  $$payload.out.push("<!--[-->");
                  $$payload.out.push(`✅ Good metadata quality`);
                } else {
                  $$payload.out.push("<!--[!-->");
                  if (state.state.metadataStats.healthScore >= 50) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`⚠️ Some issues found`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                    $$payload.out.push(`❌ Significant issues detected`);
                  }
                  $$payload.out.push(`<!--]-->`);
                }
                $$payload.out.push(`<!--]-->`);
              }
              $$payload.out.push(`<!--]--></p> <p class="issue-count svelte-hkwrsd">${escape_html(state.state.metadataStats.errorCount)} errors, ${escape_html(state.state.metadataStats.warningCount)} warnings</p></div></div> <div class="stats-grid svelte-hkwrsd"><div class="stat-item svelte-hkwrsd"><span class="stat-label svelte-hkwrsd">Real Beats:</span> <span class="stat-value svelte-hkwrsd">${escape_html(state.state.metadataStats.realBeatsCount)}</span></div> <div class="stat-item svelte-hkwrsd"><span class="stat-label svelte-hkwrsd">Total Length:</span> <span class="stat-value svelte-hkwrsd">${escape_html(state.state.metadataStats.sequenceLength)}</span></div> <div class="stat-item svelte-hkwrsd"><span class="stat-label svelte-hkwrsd">Start Positions:</span> <span class="stat-value svelte-hkwrsd">${escape_html(state.state.metadataStats.startPositionCount)}</span></div> <div class="stat-item svelte-hkwrsd"><span class="stat-label svelte-hkwrsd">Author:</span> <span${attr_class("stat-value svelte-hkwrsd", void 0, { "error": state.state.metadataStats.authorMissing })}>${escape_html(state.state.metadataStats.hasAuthor ? state.state.metadataStats.authorName : "❌ Missing")}</span></div> <div class="stat-item svelte-hkwrsd"><span class="stat-label svelte-hkwrsd">Level:</span> <span${attr_class("stat-value svelte-hkwrsd", void 0, {
                "error": state.state.metadataStats.levelMissing || state.state.metadataStats.levelZero
              })}>${escape_html(state.state.metadataStats.hasLevel ? state.state.metadataStats.levelZero ? "⚠️ 0 (needs calculation)" : state.state.metadataStats.level : "❌ Missing")}</span></div> <div class="stat-item svelte-hkwrsd"><span class="stat-label svelte-hkwrsd">Start Position:</span> <span${attr_class("stat-value svelte-hkwrsd", void 0, { "error": state.state.metadataStats.startPositionMissing })}>${escape_html(state.state.metadataStats.hasStartPosition ? `✅ ${state.state.metadataStats.startPositionValue}` : "❌ Missing")}</span></div></div></div> `);
              if (state.state.metadataStats.hasErrors || state.state.metadataStats.hasWarnings) {
                $$payload.out.push("<!--[-->");
                $$payload.out.push(`<div class="issues-section svelte-hkwrsd"><h3 class="svelte-hkwrsd">🚨 Issues Found</h3> `);
                if (state.state.metadataStats.hasErrors) {
                  $$payload.out.push("<!--[-->");
                  $$payload.out.push(`<div class="errors-panel svelte-hkwrsd"><h4 class="svelte-hkwrsd">❌ Critical Errors (${escape_html(state.state.metadataStats.errorCount)})</h4> <ul class="issue-list svelte-hkwrsd">`);
                  if (state.state.metadataStats.authorMissing) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="error-item svelte-hkwrsd">Missing author information - required for Browse tab filtering</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.levelMissing) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="error-item svelte-hkwrsd">Missing difficulty level - affects sequence sorting</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.levelZero) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="error-item svelte-hkwrsd">Level is 0 - indicates difficulty calculation needed</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.startPositionMissing) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="error-item svelte-hkwrsd">Missing start position - affects sequence validation</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.missingLetters.length > 0) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="error-item svelte-hkwrsd">Missing beat letters in beats: ${escape_html(state.state.metadataStats.missingLetters.join(", "))}</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.missingMotionData.length > 0) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="error-item svelte-hkwrsd">Missing motion data in beats: ${escape_html(state.state.metadataStats.missingMotionData.join(", "))}</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.missingRequiredFields.length > 0) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="error-item svelte-hkwrsd">Missing required fields (${escape_html(state.state.metadataStats.missingRequiredFields.length)} instances)</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--></ul></div>`);
                } else {
                  $$payload.out.push("<!--[!-->");
                }
                $$payload.out.push(`<!--]--> `);
                if (state.state.metadataStats.hasWarnings) {
                  $$payload.out.push("<!--[-->");
                  $$payload.out.push(`<div class="warnings-panel svelte-hkwrsd"><h4 class="svelte-hkwrsd">⚠️ Warnings (${escape_html(state.state.metadataStats.warningCount)})</h4> <ul class="issue-list svelte-hkwrsd">`);
                  if (state.state.metadataStats.authorInconsistent) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="warning-item svelte-hkwrsd">Author information is inconsistent across beats</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.levelInconsistent) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="warning-item svelte-hkwrsd">Level information is inconsistent across beats</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.startPositionInconsistent) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="warning-item svelte-hkwrsd">Multiple different start positions found</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.duplicateBeats.length > 0) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="warning-item svelte-hkwrsd">Duplicate beat numbers detected: ${escape_html(state.state.metadataStats.duplicateBeats.join(", "))}</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--> `);
                  if (state.state.metadataStats.invalidMotionTypes.length > 0) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<li class="warning-item svelte-hkwrsd">${escape_html(state.state.metadataStats.invalidMotionTypes.length)} invalid motion types found</li>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                  }
                  $$payload.out.push(`<!--]--></ul></div>`);
                } else {
                  $$payload.out.push("<!--[!-->");
                }
                $$payload.out.push(`<!--]--></div>`);
              } else {
                $$payload.out.push("<!--[!-->");
                $$payload.out.push(`<div class="success-panel svelte-hkwrsd"><h3 class="svelte-hkwrsd">✅ All Checks Passed</h3> <p class="svelte-hkwrsd">This sequence has excellent metadata quality with no detected issues!</p></div>`);
              }
              $$payload.out.push(`<!--]--> `);
              if (state.state.extractedMetadata && Array.isArray(state.state.extractedMetadata)) {
                $$payload.out.push("<!--[-->");
                const each_array_4 = ensure_array_like(state.state.extractedMetadata);
                $$payload.out.push(`<div class="beat-analysis svelte-hkwrsd"><h3 class="svelte-hkwrsd">🎵 Beat Analysis</h3> <div class="beats-container svelte-hkwrsd"><!--[-->`);
                for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
                  let beat = each_array_4[index];
                  $$payload.out.push(`<div${attr_class("beat-item svelte-hkwrsd", void 0, { "start-position": isStartPosition(beat) })}>`);
                  if (isStartPosition(beat)) {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<div class="beat-header start-pos svelte-hkwrsd"><span class="beat-type svelte-hkwrsd">Start Position</span> <span class="position-value svelte-hkwrsd">${escape_html(beat.sequence_start_position)}</span></div>`);
                  } else {
                    $$payload.out.push("<!--[!-->");
                    $$payload.out.push(`<div class="beat-header svelte-hkwrsd"><span class="beat-number svelte-hkwrsd">Beat ${escape_html(getRealBeats(state.state.extractedMetadata).indexOf(beat) + 1)}</span> <span class="beat-letter svelte-hkwrsd">${escape_html(beat.letter)}</span></div> <div class="motion-info svelte-hkwrsd"><div class="motion-item blue svelte-hkwrsd"><span class="prop-label svelte-hkwrsd">🔵 Blue:</span> <span class="motion-type svelte-hkwrsd">${escape_html(beat.blue_attributes?.motion_type || "Unknown")}</span></div> <div class="motion-item red svelte-hkwrsd"><span class="prop-label svelte-hkwrsd">🔴 Red:</span> <span class="motion-type svelte-hkwrsd">${escape_html(beat.red_attributes?.motion_type || "Unknown")}</span></div></div>`);
                  }
                  $$payload.out.push(`<!--]--></div>`);
                }
                $$payload.out.push(`<!--]--></div></div>`);
              } else {
                $$payload.out.push("<!--[!-->");
              }
              $$payload.out.push(`<!--]--> <details class="raw-data svelte-hkwrsd"><summary class="svelte-hkwrsd">🔍 Raw JSON Data</summary> <pre class="json-content svelte-hkwrsd">${escape_html(state.state.rawMetadata)}</pre></details></div>`);
            }
            $$payload.out.push(`<!--]-->`);
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
  $$payload.out.push(`<!--]--></div></div>`);
  pop();
}
function createMetadataTesterState() {
  let state = {
    thumbnails: [],
    selectedThumbnail: null,
    extractedMetadata: null,
    rawMetadata: null,
    isLoadingThumbnails: false,
    isExtractingMetadata: false,
    isBatchAnalyzing: false,
    error: null,
    metadataStats: null
  };
  async function loadThumbnails() {
    state.isLoadingThumbnails = true;
    state.error = null;
    try {
      const thumbnails = [];
      try {
        const response = await fetch("/api/sequences");
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.sequences)) {
            const filteredSequences = data.sequences.filter((seq) => seq.word !== "A_A" && !seq.word.includes("_") && seq.word.length > 0);
            state.thumbnails = filteredSequences;
            console.log(`✅ Loaded ${filteredSequences.length} sequences from API (${data.sequences.length - filteredSequences.length} filtered out)`);
            return;
          }
        }
      } catch {
        console.log("📡 API not available, using manual discovery...");
      }
      const knownSequences = [
        "ABC",
        "A",
        "CAKE",
        "ALPHA",
        "EPSILON",
        "ETA",
        "MU",
        "B",
        "C",
        "DJ",
        "DJII",
        "DKIIEJII",
        "EJ",
        "EK",
        "FJ",
        "FL",
        "FLII",
        "G",
        "H",
        "I",
        "JD",
        "JGG",
        "KE",
        "LF",
        "MOON",
        "MP",
        "NQ",
        "OR",
        "OT",
        "PQV",
        "QT",
        "RT",
        "S",
        "T",
        "U",
        "V",
        "POSSUM",
        "OPOSSUM",
        "OPPOSSUM"
      ];
      const validSequences = knownSequences.filter((seq) => !seq.includes("_") && // Exclude sequences with underscores (test sequences)
      seq !== "A_A" && // Specifically exclude A_A
      seq.length > 0);
      let foundCount = 0;
      for (const sequenceName of validSequences) {
        const filePath = `/dictionary/${sequenceName}/${sequenceName}_ver1.png`;
        try {
          const response = await fetch(filePath, { method: "HEAD" });
          if (response.ok) {
            thumbnails.push({
              name: `${sequenceName}_ver1.png`,
              path: filePath,
              word: sequenceName
            });
            foundCount++;
            console.log(`✅ Found: ${sequenceName}`);
          } else {
            console.log(`❌ Not found: ${sequenceName} (${response.status})`);
          }
        } catch (error) {
          console.log(`❌ Error checking ${sequenceName}:`, error);
        }
      }
      const staticThumbnails = [];
      for (const thumb of staticThumbnails) {
        try {
          const response = await fetch(thumb.path, { method: "HEAD" });
          if (response.ok) {
            thumbnails.push(thumb);
            foundCount++;
            console.log(`✅ Found thumbnail: ${thumb.word}`);
          }
        } catch {
          console.log(`❌ Thumbnail not found: ${thumb.word}`);
        }
      }
      thumbnails.sort((a, b) => a.word.localeCompare(b.word));
      state.thumbnails = thumbnails;
      console.log(`🎯 Total sequences loaded: ${foundCount}`);
      if (foundCount === 0) {
        state.error = "No sequence files found. Please check that PNG files exist in the dictionary directories.";
      }
    } catch (error) {
      state.error = `Failed to load thumbnails: ${error}`;
      console.error("❌ Error loading thumbnails:", error);
    } finally {
      state.isLoadingThumbnails = false;
    }
  }
  async function extractMetadata(thumbnail) {
    state.isExtractingMetadata = true;
    state.error = null;
    state.selectedThumbnail = thumbnail;
    try {
      const metadata = await PngMetadataExtractor.extractMetadata(thumbnail.path);
      state.extractedMetadata = metadata;
      state.rawMetadata = JSON.stringify(metadata, null, 2);
      analyzeMetadata(metadata);
    } catch (error) {
      state.error = `Failed to extract metadata: ${error}`;
      state.extractedMetadata = null;
      state.rawMetadata = null;
      state.metadataStats = null;
      console.error("Error extracting metadata:", error);
    } finally {
      state.isExtractingMetadata = false;
    }
  }
  function analyzeMetadata(metadata) {
    if (!metadata || !Array.isArray(metadata)) {
      state.metadataStats = null;
      return;
    }
    console.log("🔍 Starting deep metadata analysis...");
    const startPositionEntries = metadata.filter((step) => step.sequence_start_position);
    const realBeats = metadata.filter((step) => step.letter && !step.sequence_start_position);
    const totalBeats = realBeats.length;
    const sequenceLength = metadata.length;
    const realBeatsCount = realBeats.length;
    const startPositionCount = startPositionEntries.length;
    const firstStep = metadata[0] || {};
    const hasAuthor = !!firstStep.author;
    const authorName = firstStep.author || null;
    const authorMissing = !hasAuthor;
    const authorsFound = new Set(metadata.map((step) => step.author).filter(Boolean));
    const authorInconsistent = authorsFound.size > 1;
    const hasLevel = !!firstStep.level;
    const level = firstStep.level || null;
    const levelMissing = !hasLevel;
    const levelZero = level === 0;
    const levelsFound = new Set(metadata.map((step) => step.level).filter((l) => l !== void 0 && l !== null));
    const levelInconsistent = levelsFound.size > 1;
    const hasStartPosition = startPositionCount > 0;
    const startPositionMissing = !hasStartPosition;
    const startPositionValue = startPositionEntries[0]?.sequence_start_position || null;
    const startPositionsFound = new Set(startPositionEntries.map((step) => step.sequence_start_position));
    const startPositionInconsistent = startPositionsFound.size > 1;
    const missingBeatNumbers = [];
    const missingLetters = [];
    const missingMotionData = [];
    const invalidMotionTypes = [];
    const duplicateBeats = [];
    const invalidBeatStructure = [];
    const missingRequiredFields = [];
    const validMotionTypes = [
      "pro",
      "anti",
      "static",
      "float",
      "dash",
      "bi_static",
      "shift",
      "kinetic_shift"
    ];
    const seenBeatNumbers = /* @__PURE__ */ new Set();
    realBeats.forEach((beat, index) => {
      const beatNumber = index + 1;
      if (!beat.letter) {
        missingLetters.push(beatNumber);
      }
      if (beat.beat_number !== void 0) {
        if (seenBeatNumbers.has(beat.beat_number)) {
          duplicateBeats.push(beatNumber);
        }
        seenBeatNumbers.add(beat.beat_number);
      }
      if (!beat.blue_attributes && !beat.red_attributes) {
        missingMotionData.push(beatNumber);
      } else {
        if (beat.blue_attributes) {
          const blueMotion = beat.blue_attributes.motion_type;
          if (!blueMotion) {
            missingRequiredFields.push({ beat: beatNumber, field: "blue_attributes.motion_type" });
          } else if (!validMotionTypes.includes(blueMotion)) {
            invalidMotionTypes.push({ beat: beatNumber, prop: "blue", type: blueMotion });
          }
        }
        if (beat.red_attributes) {
          const redMotion = beat.red_attributes.motion_type;
          if (!redMotion) {
            missingRequiredFields.push({ beat: beatNumber, field: "red_attributes.motion_type" });
          } else if (!validMotionTypes.includes(redMotion)) {
            invalidMotionTypes.push({ beat: beatNumber, prop: "red", type: redMotion });
          }
        }
      }
      if (!beat.letter && !beat.blue_attributes && !beat.red_attributes) {
        invalidBeatStructure.push(beatNumber);
      }
    });
    let errorCount = 0;
    let warningCount = 0;
    if (authorMissing) errorCount++;
    if (levelMissing) errorCount++;
    if (startPositionMissing) errorCount++;
    if (levelZero) errorCount++;
    errorCount += missingBeatNumbers.length;
    errorCount += missingLetters.length;
    errorCount += missingMotionData.length;
    errorCount += invalidBeatStructure.length;
    errorCount += missingRequiredFields.length;
    if (authorInconsistent) warningCount++;
    if (levelInconsistent) warningCount++;
    if (startPositionInconsistent) warningCount++;
    warningCount += duplicateBeats.length;
    warningCount += invalidMotionTypes.length;
    const hasErrors = errorCount > 0;
    const hasWarnings = warningCount > 0;
    const maxPossibleIssues = 10;
    const totalIssues = errorCount + warningCount * 0.5;
    const healthScore = Math.max(0, Math.round((1 - totalIssues / maxPossibleIssues) * 100));
    const errors = [];
    const warnings = [];
    if (authorMissing) errors.push("Missing author");
    if (levelMissing) errors.push("Missing level");
    if (startPositionMissing) errors.push("Missing start position");
    if (missingLetters.length > 0) errors.push(`Missing letters in ${missingLetters.length} beats`);
    if (missingMotionData.length > 0) errors.push(`Missing motion data in ${missingMotionData.length} beats`);
    if (invalidMotionTypes.length > 0) errors.push(`Invalid motion types in ${invalidMotionTypes.length} beats`);
    if (duplicateBeats.length > 0) errors.push(`Duplicate beats found: ${duplicateBeats.length}`);
    if (invalidBeatStructure.length > 0) errors.push(`Invalid beat structure in ${invalidBeatStructure.length} beats`);
    if (authorInconsistent) warnings.push("Author inconsistent across beats");
    if (levelInconsistent) warnings.push("Level inconsistent across beats");
    if (levelZero) warnings.push("Level is zero (may be invalid)");
    if (startPositionInconsistent) warnings.push("Start position inconsistent");
    if (missingRequiredFields.length > 0) warnings.push(`Missing required fields in ${missingRequiredFields.length} beats`);
    if (realBeatsCount !== sequenceLength && sequenceLength > 0) warnings.push("Beat count mismatch with sequence length");
    state.metadataStats = {
      // Basic counts
      totalBeats,
      sequenceLength,
      realBeatsCount,
      startPositionCount,
      // Author validation
      hasAuthor,
      authorName,
      authorMissing,
      authorInconsistent,
      // Level validation
      hasLevel,
      level,
      levelMissing,
      levelInconsistent,
      levelZero,
      // Start position validation
      hasStartPosition,
      startPositionMissing,
      startPositionInconsistent,
      startPositionValue,
      // Beat validation
      missingBeatNumbers,
      missingLetters,
      missingMotionData,
      invalidMotionTypes,
      // Data integrity issues
      duplicateBeats,
      invalidBeatStructure,
      missingRequiredFields,
      // Overall health
      hasErrors,
      hasWarnings,
      errorCount,
      warningCount,
      healthScore,
      // Error and warning details for batch analysis
      errors,
      warnings
    };
    console.log("📊 Metadata Analysis Results:");
    console.log(`   Health Score: ${healthScore}/100`);
    console.log(`   Errors: ${errorCount}, Warnings: ${warningCount}`);
    console.log(`   Author: ${authorName || "MISSING"}`);
    console.log(`   Level: ${level !== null ? level : "MISSING"}`);
    console.log(`   Start Position: ${startPositionValue || "MISSING"}`);
    console.log(`   Beats: ${totalBeats}, Sequence Length: ${sequenceLength}`);
    if (hasErrors || hasWarnings) {
      console.log("⚠️ Issues found:");
      if (authorMissing) console.log("   - Missing author");
      if (levelMissing) console.log("   - Missing level");
      if (startPositionMissing) console.log("   - Missing start position");
      if (missingLetters.length) console.log(`   - Missing letters in beats: ${missingLetters.join(", ")}`);
      if (missingMotionData.length) console.log(`   - Missing motion data in beats: ${missingMotionData.join(", ")}`);
      if (invalidMotionTypes.length) console.log(`   - Invalid motion types: ${invalidMotionTypes.length} found`);
    }
  }
  async function handleBatchAnalyze() {
    console.log("Starting batch metadata analysis...");
    state.isBatchAnalyzing = true;
    state.error = null;
    try {
      let analyzed = 0;
      let totalErrors = 0;
      let totalWarnings = 0;
      let healthySequences = 0;
      let totalHealthScore = 0;
      const sequenceResults = {};
      const errorPatterns = {};
      const warningPatterns = {};
      for (const thumbnail of state.thumbnails) {
        console.log(`Analyzing sequence: ${thumbnail.word}`);
        await extractMetadata(thumbnail);
        if (state.metadataStats) {
          analyzeMetadata(state.extractedMetadata);
        }
        if (state.metadataStats) {
          const errorCount = state.metadataStats.errors?.length || 0;
          const warningCount = state.metadataStats.warnings?.length || 0;
          sequenceResults[thumbnail.word] = {
            healthScore: state.metadataStats.healthScore,
            errorCount,
            warningCount,
            isHealthy: state.metadataStats.healthScore >= 80,
            errors: state.metadataStats.errors || [],
            warnings: state.metadataStats.warnings || []
          };
          totalErrors += errorCount;
          totalWarnings += warningCount;
          totalHealthScore += state.metadataStats.healthScore;
          if (state.metadataStats.healthScore >= 80) healthySequences++;
          if (state.metadataStats.errors) {
            state.metadataStats.errors.forEach((error) => {
              errorPatterns[error] = (errorPatterns[error] || 0) + 1;
            });
          }
          if (state.metadataStats.warnings) {
            state.metadataStats.warnings.forEach((warning) => {
              warningPatterns[warning] = (warningPatterns[warning] || 0) + 1;
            });
          }
        }
        analyzed++;
      }
      const averageHealth = totalHealthScore / analyzed;
      const batchSummary = {
        sequencesAnalyzed: analyzed,
        healthySequences,
        unhealthySequences: analyzed - healthySequences,
        averageHealthScore: Math.round(averageHealth * 10) / 10,
        totalErrors,
        totalWarnings,
        commonErrors: Object.entries(errorPatterns).sort((a, b) => b[1] - a[1]).slice(0, 5),
        commonWarnings: Object.entries(warningPatterns).sort((a, b) => b[1] - a[1]).slice(0, 5),
        worstSequences: Object.entries(sequenceResults).sort((a, b) => a[1].healthScore - b[1].healthScore).slice(0, 5).map(([seq, data]) => ({ sequence: seq, healthScore: data.healthScore })),
        bestSequences: Object.entries(sequenceResults).sort((a, b) => b[1].healthScore - a[1].healthScore).slice(0, 5).map(([seq, data]) => ({ sequence: seq, healthScore: data.healthScore }))
      };
      state.selectedThumbnail = null;
      state.metadataStats = {
        // Copy existing structure with defaults
        totalBeats: 0,
        sequenceLength: 0,
        realBeatsCount: 0,
        startPositionCount: 0,
        hasAuthor: false,
        authorName: null,
        authorMissing: true,
        authorInconsistent: false,
        hasLevel: false,
        level: null,
        levelMissing: true,
        levelInconsistent: false,
        levelZero: false,
        hasStartPosition: false,
        startPositionMissing: true,
        startPositionInconsistent: false,
        startPositionValue: null,
        missingBeatNumbers: [],
        missingLetters: [],
        missingMotionData: [],
        invalidMotionTypes: [],
        duplicateBeats: [],
        invalidBeatStructure: [],
        missingRequiredFields: [],
        hasErrors: totalErrors > 0,
        hasWarnings: totalWarnings > 0,
        errorCount: totalErrors,
        warningCount: totalWarnings,
        healthScore: averageHealth,
        errors: Object.keys(errorPatterns),
        warnings: Object.keys(warningPatterns),
        isBatchSummary: true,
        batchSummary
      };
      console.log(`Batch Analysis Complete:`);
      console.log(`- Sequences Analyzed: ${analyzed}`);
      console.log(`- Healthy Sequences (80+ score): ${healthySequences} (${Math.round(healthySequences / analyzed * 100)}%)`);
      console.log(`- Unhealthy Sequences: ${analyzed - healthySequences} (${Math.round((analyzed - healthySequences) / analyzed * 100)}%)`);
      console.log(`- Average Health Score: ${averageHealth.toFixed(1)}%`);
      console.log(`- Total Errors: ${totalErrors}`);
      console.log(`- Total Warnings: ${totalWarnings}`);
      console.log(`- Most Common Errors:`, batchSummary.commonErrors);
      console.log(`- Most Common Warnings:`, batchSummary.commonWarnings);
      console.log("Batch summary created:", batchSummary);
    } catch (error) {
      console.error("Batch analysis failed:", error);
      state.error = `Batch analysis failed: ${error}`;
    } finally {
      state.isBatchAnalyzing = false;
    }
  }
  function clearSelection() {
    state.selectedThumbnail = null;
    state.extractedMetadata = null;
    state.rawMetadata = null;
    state.metadataStats = null;
    state.error = null;
  }
  loadThumbnails();
  return {
    get state() {
      return state;
    },
    loadThumbnails,
    extractMetadata,
    clearSelection,
    analyzeMetadata,
    handleBatchAnalyze
  };
}
function MetadataTesterInterface($$payload, $$props) {
  push();
  const state = createMetadataTesterState();
  $$payload.out.push(`<div class="metadata-tester-container svelte-1nu9hnp"><header class="tester-header svelte-1nu9hnp"><h1 class="svelte-1nu9hnp">🔍 TKA Metadata Tester</h1> <p class="svelte-1nu9hnp">Test and validate PNG metadata extraction for sequence files</p></header> <main class="tester-main svelte-1nu9hnp"><div class="panel thumbnail-browser svelte-1nu9hnp">`);
  ThumbnailBrowser($$payload, { state });
  $$payload.out.push(`<!----></div> <div class="panel metadata-display svelte-1nu9hnp">`);
  MetadataDisplay($$payload, { state });
  $$payload.out.push(`<!----></div></main></div>`);
  pop();
}
function _page($$payload) {
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>TKA Metadata Tester - PNG Metadata Validation</title>`;
  });
  MetadataTesterInterface($$payload);
}
export {
  _page as default
};
