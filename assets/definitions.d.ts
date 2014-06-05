declare module fluxreader{

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
        refreshedAt:Date;
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

    interface Folder{
        title:string;
        open:boolean;
        createdAt:Date;
        foo:string;
    }

    interface FolderRepository<T>{
        findAll(query):Promise<T[]>;
        find(query):Promise<T>;
        insert(f:T):Promise<T>;
        update(f:T):Promise<T>;
        delete(f:T):Promise<T>;
    }
}

interface Promise<T>{

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


