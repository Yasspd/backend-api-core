import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type UsersModel = runtime.Types.Result.DefaultSelection<Prisma.$UsersPayload>;
export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null;
    _avg: UsersAvgAggregateOutputType | null;
    _sum: UsersSumAggregateOutputType | null;
    _min: UsersMinAggregateOutputType | null;
    _max: UsersMaxAggregateOutputType | null;
};
export type UsersAvgAggregateOutputType = {
    id: number | null;
};
export type UsersSumAggregateOutputType = {
    id: number | null;
};
export type UsersMinAggregateOutputType = {
    id: number | null;
    email: string | null;
    password: string | null;
    username: string | null;
    createAt: Date | null;
};
export type UsersMaxAggregateOutputType = {
    id: number | null;
    email: string | null;
    password: string | null;
    username: string | null;
    createAt: Date | null;
};
export type UsersCountAggregateOutputType = {
    id: number;
    email: number;
    password: number;
    username: number;
    createAt: number;
    _all: number;
};
export type UsersAvgAggregateInputType = {
    id?: true;
};
export type UsersSumAggregateInputType = {
    id?: true;
};
export type UsersMinAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    username?: true;
    createAt?: true;
};
export type UsersMaxAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    username?: true;
    createAt?: true;
};
export type UsersCountAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    username?: true;
    createAt?: true;
    _all?: true;
};
export type UsersAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput | Prisma.UsersOrderByWithRelationInput[];
    cursor?: Prisma.UsersWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UsersCountAggregateInputType;
    _avg?: UsersAvgAggregateInputType;
    _sum?: UsersSumAggregateInputType;
    _min?: UsersMinAggregateInputType;
    _max?: UsersMaxAggregateInputType;
};
export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
    [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUsers[P]> : Prisma.GetScalarType<T[P], AggregateUsers[P]>;
};
export type UsersGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithAggregationInput | Prisma.UsersOrderByWithAggregationInput[];
    by: Prisma.UsersScalarFieldEnum[] | Prisma.UsersScalarFieldEnum;
    having?: Prisma.UsersScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UsersCountAggregateInputType | true;
    _avg?: UsersAvgAggregateInputType;
    _sum?: UsersSumAggregateInputType;
    _min?: UsersMinAggregateInputType;
    _max?: UsersMaxAggregateInputType;
};
export type UsersGroupByOutputType = {
    id: number;
    email: string;
    password: string;
    username: string | null;
    createAt: Date;
    _count: UsersCountAggregateOutputType | null;
    _avg: UsersAvgAggregateOutputType | null;
    _sum: UsersSumAggregateOutputType | null;
    _min: UsersMinAggregateOutputType | null;
    _max: UsersMaxAggregateOutputType | null;
};
export type GetUsersGroupByPayload<T extends UsersGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UsersGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UsersGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UsersGroupByOutputType[P]>;
}>>;
export type UsersWhereInput = {
    AND?: Prisma.UsersWhereInput | Prisma.UsersWhereInput[];
    OR?: Prisma.UsersWhereInput[];
    NOT?: Prisma.UsersWhereInput | Prisma.UsersWhereInput[];
    id?: Prisma.IntFilter<"Users"> | number;
    email?: Prisma.StringFilter<"Users"> | string;
    password?: Prisma.StringFilter<"Users"> | string;
    username?: Prisma.StringNullableFilter<"Users"> | string | null;
    createAt?: Prisma.DateTimeFilter<"Users"> | Date | string;
};
export type UsersOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    username?: Prisma.SortOrderInput | Prisma.SortOrder;
    createAt?: Prisma.SortOrder;
};
export type UsersWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    email?: string;
    AND?: Prisma.UsersWhereInput | Prisma.UsersWhereInput[];
    OR?: Prisma.UsersWhereInput[];
    NOT?: Prisma.UsersWhereInput | Prisma.UsersWhereInput[];
    password?: Prisma.StringFilter<"Users"> | string;
    username?: Prisma.StringNullableFilter<"Users"> | string | null;
    createAt?: Prisma.DateTimeFilter<"Users"> | Date | string;
}, "id" | "email">;
export type UsersOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    username?: Prisma.SortOrderInput | Prisma.SortOrder;
    createAt?: Prisma.SortOrder;
    _count?: Prisma.UsersCountOrderByAggregateInput;
    _avg?: Prisma.UsersAvgOrderByAggregateInput;
    _max?: Prisma.UsersMaxOrderByAggregateInput;
    _min?: Prisma.UsersMinOrderByAggregateInput;
    _sum?: Prisma.UsersSumOrderByAggregateInput;
};
export type UsersScalarWhereWithAggregatesInput = {
    AND?: Prisma.UsersScalarWhereWithAggregatesInput | Prisma.UsersScalarWhereWithAggregatesInput[];
    OR?: Prisma.UsersScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UsersScalarWhereWithAggregatesInput | Prisma.UsersScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Users"> | number;
    email?: Prisma.StringWithAggregatesFilter<"Users"> | string;
    password?: Prisma.StringWithAggregatesFilter<"Users"> | string;
    username?: Prisma.StringNullableWithAggregatesFilter<"Users"> | string | null;
    createAt?: Prisma.DateTimeWithAggregatesFilter<"Users"> | Date | string;
};
export type UsersCreateInput = {
    email: string;
    password: string;
    username?: string | null;
    createAt: Date | string;
};
export type UsersUncheckedCreateInput = {
    id?: number;
    email: string;
    password: string;
    username?: string | null;
    createAt: Date | string;
};
export type UsersUpdateInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsersUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsersCreateManyInput = {
    id?: number;
    email: string;
    password: string;
    username?: string | null;
    createAt: Date | string;
};
export type UsersUpdateManyMutationInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsersUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsersCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    createAt?: Prisma.SortOrder;
};
export type UsersAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type UsersMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    createAt?: Prisma.SortOrder;
};
export type UsersMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    createAt?: Prisma.SortOrder;
};
export type UsersSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type UsersSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    username?: boolean;
    createAt?: boolean;
}, ExtArgs["result"]["users"]>;
export type UsersSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    username?: boolean;
    createAt?: boolean;
}, ExtArgs["result"]["users"]>;
export type UsersSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    username?: boolean;
    createAt?: boolean;
}, ExtArgs["result"]["users"]>;
export type UsersSelectScalar = {
    id?: boolean;
    email?: boolean;
    password?: boolean;
    username?: boolean;
    createAt?: boolean;
};
export type UsersOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "email" | "password" | "username" | "createAt", ExtArgs["result"]["users"]>;
export type $UsersPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Users";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        email: string;
        password: string;
        username: string | null;
        createAt: Date;
    }, ExtArgs["result"]["users"]>;
    composites: {};
};
export type UsersGetPayload<S extends boolean | null | undefined | UsersDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UsersPayload, S>;
export type UsersCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UsersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UsersCountAggregateInputType | true;
};
export interface UsersDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Users'];
        meta: {
            name: 'Users';
        };
    };
    findUnique<T extends UsersFindUniqueArgs>(args: Prisma.SelectSubset<T, UsersFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UsersFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UsersFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UsersFindFirstArgs>(args?: Prisma.SelectSubset<T, UsersFindFirstArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UsersFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UsersFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UsersFindManyArgs>(args?: Prisma.SelectSubset<T, UsersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UsersCreateArgs>(args: Prisma.SelectSubset<T, UsersCreateArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UsersCreateManyArgs>(args?: Prisma.SelectSubset<T, UsersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UsersCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UsersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UsersDeleteArgs>(args: Prisma.SelectSubset<T, UsersDeleteArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UsersUpdateArgs>(args: Prisma.SelectSubset<T, UsersUpdateArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UsersDeleteManyArgs>(args?: Prisma.SelectSubset<T, UsersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UsersUpdateManyArgs>(args: Prisma.SelectSubset<T, UsersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UsersUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UsersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UsersUpsertArgs>(args: Prisma.SelectSubset<T, UsersUpsertArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UsersCountArgs>(args?: Prisma.Subset<T, UsersCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UsersCountAggregateOutputType> : number>;
    aggregate<T extends UsersAggregateArgs>(args: Prisma.Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>;
    groupBy<T extends UsersGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UsersGroupByArgs['orderBy'];
    } : {
        orderBy?: UsersGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UsersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UsersFieldRefs;
}
export interface Prisma__UsersClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UsersFieldRefs {
    readonly id: Prisma.FieldRef<"Users", 'Int'>;
    readonly email: Prisma.FieldRef<"Users", 'String'>;
    readonly password: Prisma.FieldRef<"Users", 'String'>;
    readonly username: Prisma.FieldRef<"Users", 'String'>;
    readonly createAt: Prisma.FieldRef<"Users", 'DateTime'>;
}
export type UsersFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    where: Prisma.UsersWhereUniqueInput;
};
export type UsersFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    where: Prisma.UsersWhereUniqueInput;
};
export type UsersFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput | Prisma.UsersOrderByWithRelationInput[];
    cursor?: Prisma.UsersWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsersScalarFieldEnum | Prisma.UsersScalarFieldEnum[];
};
export type UsersFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput | Prisma.UsersOrderByWithRelationInput[];
    cursor?: Prisma.UsersWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsersScalarFieldEnum | Prisma.UsersScalarFieldEnum[];
};
export type UsersFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput | Prisma.UsersOrderByWithRelationInput[];
    cursor?: Prisma.UsersWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsersScalarFieldEnum | Prisma.UsersScalarFieldEnum[];
};
export type UsersCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsersCreateInput, Prisma.UsersUncheckedCreateInput>;
};
export type UsersCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UsersCreateManyInput | Prisma.UsersCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UsersCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    data: Prisma.UsersCreateManyInput | Prisma.UsersCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UsersUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsersUpdateInput, Prisma.UsersUncheckedUpdateInput>;
    where: Prisma.UsersWhereUniqueInput;
};
export type UsersUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UsersUpdateManyMutationInput, Prisma.UsersUncheckedUpdateManyInput>;
    where?: Prisma.UsersWhereInput;
    limit?: number;
};
export type UsersUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsersUpdateManyMutationInput, Prisma.UsersUncheckedUpdateManyInput>;
    where?: Prisma.UsersWhereInput;
    limit?: number;
};
export type UsersUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    where: Prisma.UsersWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsersCreateInput, Prisma.UsersUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UsersUpdateInput, Prisma.UsersUncheckedUpdateInput>;
};
export type UsersDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    where: Prisma.UsersWhereUniqueInput;
};
export type UsersDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsersWhereInput;
    limit?: number;
};
export type UsersDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
};
