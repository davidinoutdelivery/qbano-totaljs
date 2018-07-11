/** Items del carrito */

exports.create = function(product) {

    valuesMeals = valueMeals(product);

    //Devuelve el formato necesario para guardar un item del carrito
    return {
        amount: 1,
        price: (product.price)? product.price: product.priceDefault,
        product: product.id,
        comment: "Web",
        code: valuesMeals.code?valuesMeals.code:"",
        modifiers: modifiers(product),
        modifiersGroups: modifiersGroups(product),
        valueMeals: valuesMeals.valuesMeals?valuesMeals.valuesMeals:[],
        nameValueMeal: valuesMeals.name?valuesMeals.name:"",
        productsCoupons: cupons(product),
    }
    
    //Devuelve los valuesmeals de un producto, el formato cambia si es una promoción
    function valueMeals(product) {
        res = [];
        if (product.isCoupon) {
            if(product.purchase) {
                if (product.purchase[0].valuesMeals) {
                    res= getValuesMealsPromo(product.valuesMeals, product.purchase[0]);
                }
            }
        }
        else {
            if(product.purchase) {
                if (product.purchase.valuesMeals) {
                    res= getValuesMeals(product.valuesMeals,product.purchase.valuesMeals);
                }
            }
        }
        return res;
}

function getValuesMealsPromo(valuesMeals, purchase){

    var tmp= true;
    var res = {}
    var resvalues=[];
    var productvalues = [];

    var code = purchase.valuesMeals[purchase.code];
    for (var item in code) {
        for (var buy of code[item]) {
            tmp = true;
            for (var values of valuesMeals) {
                if(values.code === purchase.code){
                    for (var spec of values.items) {
                        for(var produc of spec.items) {
                            if ((produc.product.id === buy) && tmp) {
                                tmp = false;
                                resvalues.push(
                                    { code:produc.code, 
                                    price: produc.price,
                                    product : produc.product.id,
                                    name:produc.product.name
                                    }
                                );
                            }                        
                        }
                        
                    }
                    res.code = values.code;
                    res.name= values.name;
                }

            }
        }
        res.valuesMeals = resvalues;
    }
    return res;
}

function getValuesMeals(valuesMeals, items){
    res = {}
    resvalues=[];
    productvalues = [];
    for(let value of valuesMeals) { 
        if(items[value.code]){
            for(let item of value.items){
                for(let nos of item.items) {
                    if(nos.product.id === items[value.code][item.name]){
                        resvalues.push(
                            { code:nos.code, 
                              price: nos.price,
                              product : nos.product.id,
                              name:item.name}
                             );
                    }   
                }
            }
            res= {code:value.code, valuesMeals:resvalues, name: value.name};
        }
    }
    return res;
}



    function modifiers(product) {
        let result = [];
        if(product.purchase) {
            if (product.purchase.modifiers) {
                for(let item in product.purchase.modifiers) {
                    k = getModifier(product.modifiers, item ,product.purchase.modifiers[item] );
                    result = result.concat(k);
                    
                }
            }
        }
        return result;
    }

    function getModifier(modifiers, name, items) {
        var result = [];
        if(modifiers) {
        for(let modifier of modifiers) {  
            if (modifier.name == name) {
                for (let item of modifier.items) {
                    let p = {};                   
                    if (items[item.name] === item.name) {       
                        p["modifier"]= modifier.id;
                        p["modifierItem"]= item.id;
                        p["price"]= item.price;
                        result.push(p);
                    }
                }
            }
        }
        }
        return result;
    }

    function modifiersGroups(product) {
        let result = [];
        if(product.purchase) {
            if (product.purchase.modifiersGroups) {
                for(let item in product.purchase.modifiersGroups) {
                    k = getModifierGroup(product.modifiersGroups, item ,product.purchase.modifiersGroups[item] );
                    result = result.concat(k);           
                }
            }
        }
        return result;

    }

    function getModifierGroup(modifiersGroup, name, items) {
        var result = [];
        for(let modifierG of modifiersGroup) {
            var m = {};
            m["group"]= modifierG.id;
            m["modifiers"] = [];
            for(let modifier of modifierG.modifiers) {
                    for(let item of modifier.items) {
                        p= {}                  
                        if (items[modifier.name] == item.name ) {
                            p["modifier"]= modifier.id;
                            p["modifierItem"]= item.id;
                            p["price"]= item.price || 0;
                            m["modifiers"].push(p);
                        }
                    }
            }

           if (m["modifiers"].length > 0) {
                result.push(m);
            }
            
        }
        return result;

    }

    function cupons(product) {
        var coupons = [];
        if (product.isCoupon) {
            for (var valuescupon of product.valuesMeals) {
                if (valuescupon.code === product.purchase[0].code) {
                    for (var cupon=0; cupon< valuescupon.productsCoupon.length; cupon++ ) {
                        //es necesario tener el campo purchase para los calculos
                        valuescupon.productsCoupon[cupon].purchase = product.purchase[cupon];
                        coupons.push({
                            amount: 1,
                            price: (valuescupon.productsCoupon[cupon].price)? valuescupon.productsCoupon[cupon].price: valuescupon.productsCoupon[cupon].priceDefault,
                            product: valuescupon.productsCoupon[cupon].id,
                            comment: "Web",
                            code: valuescupon.code,
                            modifiers: modifiers(valuescupon.productsCoupon[cupon]),
                            modifiersGroups: modifiersGroups(valuescupon.productsCoupon[cupon]),
                        });
                    }
                }
            }
        }
        return coupons;
    }
};