import test from 'node:test';
import assert from 'node:assert/strict';
import {worldIllustration} from '../js/home-art.js';
test('six homes retain window, furniture and identical geometry',()=>{const variants=['story','monsoon','sunroom','terracotta','midnight','cosmos'].map(worldIllustration);assert.equal(new Set(variants).size,6);for(const svg of variants){assert.ok(svg.includes('viewBox="0 0 900 780"'));assert.ok(svg.includes('-wall'));assert.ok(svg.includes('-sky'));assert.ok(svg.includes('M335 590'));}});
