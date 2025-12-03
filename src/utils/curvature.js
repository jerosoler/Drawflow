/**
 * Create a curvature path for connections
 * @param {number} start_pos_x - Starting X position
 * @param {number} start_pos_y - Starting Y position
 * @param {number} end_pos_x - Ending X position
 * @param {number} end_pos_y - Ending Y position
 * @param {number} curvature_value - Curvature amount
 * @param {string} type - Type of curve: 'open', 'close', 'other', or default 'openclose'
 * @returns {string} - SVG path string
 */
export function createCurvature(start_pos_x, start_pos_y, end_pos_x, end_pos_y, curvature_value, type) {
  var line_x = start_pos_x;
  var line_y = start_pos_y;
  var x = end_pos_x;
  var y = end_pos_y;
  var curvature = curvature_value;
  switch (type) {
    case 'open':
      if(start_pos_x >= end_pos_x) {
        var hx1 = line_x + Math.abs(x - line_x) * curvature;
        var hx2 = x - Math.abs(x - line_x) * (curvature*-1);
      } else {
        var hx1 = line_x + Math.abs(x - line_x) * curvature;
        var hx2 = x - Math.abs(x - line_x) * curvature;
      }
      return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
    case 'close':
      if(start_pos_x >= end_pos_x) {
        var hx1 = line_x + Math.abs(x - line_x) * (curvature*-1);
        var hx2 = x - Math.abs(x - line_x) * curvature;
      } else {
        var hx1 = line_x + Math.abs(x - line_x) * curvature;
        var hx2 = x - Math.abs(x - line_x) * curvature;
      }
      return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
    case 'other':
      if(start_pos_x >= end_pos_x) {
        var hx1 = line_x + Math.abs(x - line_x) * (curvature*-1);
        var hx2 = x - Math.abs(x - line_x) * (curvature*-1);
      } else {
        var hx1 = line_x + Math.abs(x - line_x) * curvature;
        var hx2 = x - Math.abs(x - line_x) * curvature;
      }
      return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
    default:
      var hx1 = line_x + Math.abs(x - line_x) * curvature;
      var hx2 = x - Math.abs(x - line_x) * curvature;
      return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
  }
}
