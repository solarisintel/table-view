var QB = function() {
    return {
        init: function(r, s, sel, isroot) {
            this.rootcondition = r;
            this.statement     = s;
            this.addqueryroot(sel, isroot);
        },
        addqueryroot : function (sel, isroot) {
            $(sel).append(this.rootcondition);
            var q = $(sel).find('table');
            var l = q.length;
            var elem = q;
            if (l > 1) {
                elem = $(q[l - 1]);
            }

            //If root element remove the close image
            if (isroot) {
                elem.find('td >.remove').detach();
            }
            else {
                elem.find('td >.remove').click(function () {
                    // td>tr>tbody>table
                    $(this).parent().parent().parent().parent().detach();
                });
            }

            // Add the default staement segment to the root condition
            elem.find('td >.querystmts').append(this.statement);

            // Add the head class to the first statement
            elem.find('td >.querystmts div >.remove').addClass('head');

            // Handle click for adding new statement segment
            // When a new statement is added add a condition to handle remove click.
            elem.find('td div >.add').click(function () {
                $(this).parent().siblings('.querystmts').append(this.statement);
                var stmts = $(this).parent().siblings('.querystmts').find('div >.remove').filter(':not(.head)');
                stmts.unbind('click');
                stmts.click(function () {
                    $(this).parent().detach();
                });
            });
            var that = this;
            // Handle click to add new root condition
            elem.find('td div > .addroot').click(function () {
                that.addqueryroot($(this).parent(), false);
            });
        },


        //Recursive method to parse the condition and generate the query. Takes the selector for the root condition
        getCondition : function (rootsel) {
            //Get the columns from table (to find a clean way to do it later) //tbody>tr>td
            var elem = $(rootsel).children().children().children();
            //elem 0 is for operator, elem 1 is for expressions

            var q = {};
            var expressions = [];
            var nestedexpressions = [];

            var operator = $(elem[0]).find(':selected').val();
            q.operator = operator;

            // Get all the expressions in a condition
            var expressionelem = $(elem[1]).find('> .querystmts div');
            for (var i = 0; i < expressionelem.length; i++) {
                expressions[i] = {};
                var col = $(expressionelem[i]).find('.col :selected');
                var op = $(expressionelem[i]).find('.op :selected');
                expressions[i].colval = col.val();
                expressions[i].coldisp = col.text();
                expressions[i].opval = op.val();
                expressions[i].opdisp = op.text();
                expressions[i].val = $(expressionelem[i]).find(':text').val();
            }
            q.expressions = expressions;

            // Get all the nested expressions
            if ($(elem[1]).find('table').length !== 0) {
                var len = $(elem[1]).find('table').length;

                for (var k = 0; k < len; k++) {
                    nestedexpressions[k] = this.getCondition($(elem[1]).find('table')[k]);
                }
            }
            q.nestedexpressions = nestedexpressions;

            return q;
        },

        //Recursive method to iterate over the condition tree and generate the query
        getQuery : function (condition) {
            var op = [' ', condition.operator, ' '].join('');

            var e = [];
            var elen = condition.expressions.length;
            for (var i = 0; i < elen; i++) {
                var expr = condition.expressions[i];
                e.push(expr.colval + " " + expr.opval + " " + expr.val);
            }

            var n = [];
            var nlen = condition.nestedexpressions.length;
            for (var k = 0; k < nlen; k++) {
                var nestexpr = condition.nestedexpressions[k];
                var result = this.getQuery(nestexpr);
                n.push(result);
            }

            var q = [];
            if (e.length > 0)
                q.push(e.join(op));
            if (n.length > 0)
                q.push(n.join(op));

            return ['(', q.join(op), ')'].join(' ');
        }
    };
};
