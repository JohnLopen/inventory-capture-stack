"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCaptureRow = void 0;
/**
 *
 * @param capture
 * @returns
 */
const generateCaptureRow = (boxId, partId, capture, index = 0) => {
    return `
    <tr class="part-row ${!capture.is_label_photo ? `part-supplemental part-supplemental-${partId}` : `picture-row part-row-${boxId}`}">
        <td class="nested-cell" colspan="2"></td>
        <td class="nested-cell">${capture.capture_data?.status}</td>
        <td>
            <a href="#" data-part=${partId} data-capture="${capture.id}" data-picture data-index=${index + 1}>${capture.is_label_photo == 1 ? 'LABEL' : `SUPPLEMENTAL ${index + 1}`}
            </a><br /><small>Taken: ${capture.taken_on}</small>
        </td>
        <td>${capture.capture_data?.data?.dc || ''}</td>
        <td>${capture.capture_data?.data?.mpn || ''}</td>
        <td>${capture.capture_data?.data?.ipn || ''}</td>
        <td>${capture.capture_data?.data?.mfr || ''}</td>
        <td>${capture.capture_data?.data?.qty || ''}</td>
        <td>${capture.capture_data?.data?.serial || ''}</td>
        <td>${capture.capture_data?.data?.coo || ''}</td>
        <td>${capture.capture_data?.data?.rohs || ''}</td>
        <td>${capture.capture_data?.data?.msl || ''}</td>
    </tr>`;
};
exports.generateCaptureRow = generateCaptureRow;
