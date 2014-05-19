declare module model{
    interface Feed{
        id:string;
        feedUrl:string;
        description:string;
        author:string;
        title:string;
        link:string; 
        type:string;
        createdAt:Date; 
        updatedAt:Date;     
    }
    interface Entry{
        id:string;
        title:string;
        read:Date;
        publishedDate:Date;
        favorite:boolean;
        feedId:string;
        filePath:string;
        contentSnippet:string;
        createdAt:string;
        link:string;
        categories:Array<string>;
    }
}

declare module database{
    interface Record<T>{

    }
    interface Table{
        insert(record:Record<any>,callback:Function):void;
        delete(record:Record<any>,callback:Function):void;
        find(id:number,callback:Function):void;
        find(id:string,callback:Function):void;
        findAll(query:any,callback:Function):void;
        findAll(callback:Function):void;
        findOne(query:any,callback:Function):void;
        findOne(callback:Function):void;
    }
}


